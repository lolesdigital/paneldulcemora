const DM_SS_ID = '1rfAGbBaA5vhttTvIgh8EUZsg0wfBAZ2fQXPUBSE793k';
const DM_ORIGEN = 'Luis Santiago Genoud 2102, Florencio Varela, Buenos Aires, Argentina';

function doGet(e){
  const action=(e&&e.parameter&&e.parameter.action)||'health';
  if(action==='health') return json_({ok:true,service:'Dulce Mora API'});
  if(action==='products') return json_({ok:true,products:productosParaPanel_()});
  return json_({ok:false,error:'Acción inválida'});
}

function doPost(e){
  try{
    const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    const action=body.action;
    const data=body.data||{};

    if(action==='products') return json_({ok:true,products:productosParaPanel_()});
    if(action==='quote') return json_(cotizarEnvio_(data.address));
    if(action==='saveOrder') return json_(registrarPedidoLocal_(data));
    if(action==='saveExpense') return json_(registrarGasto_(data));
    if(action==='closing') return json_(cierreMes_(data.month));

    return json_({ok:false,error:'Acción inválida'});
  }catch(err){
    return json_({ok:false,error:String(err&&err.message?err.message:err)});
  }
}

function cotizarEnvio_(destino){
  if(!destino) return {ok:false,error:'Falta la dirección'};
  const d=Maps.newDirectionFinder()
    .setOrigin(DM_ORIGEN)
    .setDestination(destino)
    .setMode(Maps.DirectionFinder.Mode.DRIVING)
    .setLanguage('es')
    .setRegion('ar')
    .getDirections();

  if(!d.routes||!d.routes.length) return {ok:false,error:'No encontré una ruta para esa dirección'};
  const leg=d.routes[0].legs[0];
  const km=leg.distance.value/1000;

  let costo=null;
  if(km<=1) costo=500;
  else if(km<=2) costo=1000;
  else if(km<=3) costo=1200;

  const maps='https://www.google.com/maps/dir/?api=1&origin='+
    encodeURIComponent(DM_ORIGEN)+'&destination='+encodeURIComponent(destino);

  return {ok:true,km,costo,duracion:leg.duration.text,maps};
}

function productosParaPanel_(){
  const sh=SpreadsheetApp.openById(DM_SS_ID).getSheetByName('Productos');
  if(!sh) return [];

  return sh.getDataRange().getValues().slice(1)
    .filter(r=>{
      const a=String(r[14]??'').trim().toLowerCase();
      return r[0] && (r[14]===true || a==='sí' || a==='si' || a==='true' || r[14]===1);
    })
    .map(r=>({
      id:String(r[0]),
      name:[r[3],r[4]].filter(Boolean).join(' · '),
      price:Number(r[5]||0),
      stock:(r[9]===''||r[9]==null)?null:Number(r[9]),
      status:String(r[12]||'')
    }));
}

function buscarProducto_(id){
  const sh=SpreadsheetApp.openById(DM_SS_ID).getSheetByName('Productos');
  if(!sh) return null;
  const rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0])===String(id)){
      return {
        id:String(rows[i][0]),
        nombre:[rows[i][3],rows[i][4]].filter(Boolean).join(' · '),
        precio:Number(rows[i][5]||0),
        controlaStock:rows[i][8]===true
      };
    }
  }
  return null;
}

function descontarStockSinLock_(id,cantidad){
  const sh=SpreadsheetApp.openById(DM_SS_ID).getSheetByName('Productos');
  if(!sh) throw new Error('No encontré la hoja Productos');
  const rows=sh.getDataRange().getValues();

  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0])!==String(id)) continue;
    if(rows[i][8]!==true) return;

    const actual=Number(rows[i][9]);
    if(!Number.isFinite(actual)) throw new Error('Falta cargar stock inicial de '+id);

    sh.getRange(i+1,10).setValue(Math.max(0,actual-Number(cantidad||1)));
    SpreadsheetApp.flush();
    return;
  }
  throw new Error('Producto no encontrado: '+id);
}

function registrarPedidoLocal_(data){
  const sh=SpreadsheetApp.openById(DM_SS_ID).getSheetByName('Pedidos Local');
  if(!sh) return {ok:false,error:'No encontré la hoja Pedidos Local'};

  const items=Array.isArray(data.items)?data.items:[];
  const extras=Array.isArray(data.extras)?data.extras:[];
  if(!items.length) return {ok:false,error:'Pedido vacío'};

  const lock=LockService.getScriptLock();
  lock.waitLock(15000);

  try{
    const now=new Date();
    const costoEnvio=Number(data.costo_envio||0);

    // 1 salsa gratis por pote de helado.
    const potQty=items
      .filter(x=>/¼|1\/4|½|1\/2|1 kg|2 kg|250|500/i.test(String(x.nombre||'')))
      .reduce((a,x)=>a+Number(x.cantidad||1),0);

    let sauceIndex=0;
    const extrasTotal=extras.reduce((sum,x)=>{
      const qty=Number(x.cantidad||1);
      if(x.tipo==='sauce' || x.tipo==='salsa'){
        let subtotal=0;
        for(let i=0;i<qty;i++){
          sauceIndex++;
          if(sauceIndex>potQty) subtotal+=1500;
        }
        return sum+subtotal;
      }
      return sum+Number(x.precio||0)*qty;
    },0);

    let first=true;
    items.forEach(it=>{
      const p=buscarProducto_(it.id);
      const cantidad=Number(it.cantidad||1);
      const precio=Number(it.precio||(p?p.precio:0));

      let stockMsg='';
      if(p&&p.controlaStock){
        descontarStockSinLock_(it.id,cantidad);
        stockMsg='Sí';
      }

      const subtotal=cantidad*precio;
      const totalFila=subtotal+(first?extrasTotal+costoEnvio:0);

      sh.appendRow([
        now, now, data.canal||'GitHub Panel',
        it.id||'', p?p.nombre:(it.nombre||''), cantidad, precio, subtotal,
        data.medio_pago||'', 'Confirmado', stockMsg, data.notas||'',
        data.con_envio?'Sí':'No', data.distancia_km||'',
        first?costoEnvio:0, totalFila,
        data.cliente||'', data.telefono||'', data.direccion||'', data.referencias||'',
        data.transferencia_pagada||'', data.paga_con||'', data.vuelto||'', data.maps_link||''
      ]);
      first=false;
    });

    return {ok:true,products:productosParaPanel_()};
  }finally{
    lock.releaseLock();
  }
}

function registrarGasto_(data){
  const importe=Number(data.importe||0);
  if(!data.fecha||!data.concepto||importe<=0) return {ok:false,error:'Completá fecha, concepto e importe'};

  const sh=SpreadsheetApp.openById(DM_SS_ID).getSheetByName('Gastos');
  if(!sh) return {ok:false,error:'No encontré la hoja Gastos'};

  const p=String(data.fecha).split('-');
  const fecha=p.length===3?new Date(Number(p[0]),Number(p[1])-1,Number(p[2]),12,0,0):new Date();

  sh.appendRow([
    fecha,data.categoria||'',data.proveedor||'',data.concepto||'',importe,
    data.medio_pago||'',data.tipo||'Gasto pagado','',data.notas||''
  ]);
  return {ok:true};
}

function cierreMes_(ym){
  if(!/^\d{4}-\d{2}$/.test(String(ym||''))) return {ok:false,error:'Mes inválido'};

  const [y,m]=String(ym).split('-').map(Number);
  const ss=SpreadsheetApp.openById(DM_SS_ID);
  let ventas=0,gastos=0,deudas=0;
  const detalle=[];

  const psh=ss.getSheetByName('Pedidos Local');
  if(psh&&psh.getLastRow()>1){
    const rows=psh.getRange(2,1,psh.getLastRow()-1,Math.max(16,psh.getLastColumn())).getValues();
    rows.forEach(r=>{
      const f=fechaValida_(r[0]);
      if(!f||f.getFullYear()!==y||f.getMonth()+1!==m) return;
      if(String(r[9]||'').toLowerCase()==='cancelado') return;
      ventas+=Number(r[15]||0);
    });
  }

  const gsh=ss.getSheetByName('Gastos');
  if(gsh&&gsh.getLastRow()>1){
    const rows=gsh.getRange(2,1,gsh.getLastRow()-1,9).getValues();
    rows.forEach(r=>{
      const f=fechaValida_(r[0]);
      if(!f||f.getFullYear()!==y||f.getMonth()+1!==m) return;
      const importe=Number(r[4]||0);
      const tipo=String(r[6]||'').toLowerCase();

      if(tipo.includes('deuda')||tipo.includes('pendiente')){
        deudas+=importe;
        detalle.push({
          fecha:Utilities.formatDate(f,Session.getScriptTimeZone()||'America/Argentina/Buenos_Aires','dd/MM/yyyy'),
          proveedor:r[2]||'',concepto:r[3]||'',importe
        });
      }else{
        gastos+=importe;
      }
    });
  }

  return {ok:true,mes:ym,ventas,gastos,deudas,resultado:ventas-gastos,detalle_deudas:detalle.slice(0,20)};
}

function fechaValida_(v){
  const d=v instanceof Date?v:new Date(v);
  return isNaN(d)?null:d;
}

function json_(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
