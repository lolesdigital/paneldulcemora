const API_URL = ''; // PEGÁ ACÁ la URL /exec del Apps Script cuando lo implementes.
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1rfAGbBaA5vhttTvIgh8EUZsg0wfBAZ2fQXPUBSE793k/edit';

const state = {
  products: [],
  cart: [],
  shipping: { km:null, cost:0, time:'', maps:'' },
  lastOrder: null
};

const extras = [
  {id:'s1',name:'Salsa chocolate',price:0,type:'sauce'},
  {id:'s2',name:'Salsa frutilla',price:0,type:'sauce'},
  {id:'s3',name:'Salsa dulce de leche',price:0,type:'sauce'},
  {id:'f1',name:'Franui Leche',price:9000,type:'extra'},
  {id:'f2',name:'Franui Pink',price:9000,type:'extra'},
  {id:'f3',name:'Franui Amargo',price:9000,type:'extra'},
  {id:'f4',name:'Franui Free',price:9000,type:'extra'}
];

const fallbackProducts = [
  {id:'helado-250',name:'¼ kg de helado',price:7500,stock:null,status:'DISPONIBLE'},
  {id:'helado-500',name:'½ kg de helado',price:10500,stock:null,status:'DISPONIBLE'},
  {id:'helado-1k',name:'1 kg de helado',price:19000,stock:null,status:'DISPONIBLE'},
  {id:'helado-2k',name:'2 kg de helado',price:36000,stock:null,status:'DISPONIBLE'},
  {id:'banana-1',name:'Le Banana Bites',price:10000,stock:null,status:'DISPONIBLE'},
  {id:'guapaleta',name:'Guapaleta',price:6500,stock:null,status:'DISPONIBLE'},
  {id:'hielo-2kg',name:'Hielo 2 kg',price:3500,stock:null,status:'REVISAR'}
];

const $ = (id)=>document.getElementById(id);
const money = (n)=>'$'+Number(n||0).toLocaleString('es-AR');
const norm = (s)=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

function go(screen){
  document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
  document.querySelector(`#screen-${screen}`).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
  const nav = document.querySelector(`.nav-btn[data-go="${screen}"]`);
  if(nav) nav.classList.add('active');

  window.scrollTo({top:0,behavior:'smooth'});
  renderAll();
}

document.addEventListener('click',(e)=>{
  const goBtn=e.target.closest('[data-go]');
  if(goBtn){
    const dest=goBtn.dataset.go;
    if(dest==='customer' && !state.cart.length){
      alert('Agregá al menos un producto.');
      return;
    }
    go(dest);
  }
});

function api(action, data={}){
  if(!API_URL){
    return Promise.reject(new Error('Falta configurar API_URL en app.js'));
  }
  return fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({action,data})
  }).then(r=>r.json());
}

async function loadProducts(){
  try{
    if(!API_URL) throw new Error('sin api');
    const res=await api('products');
    state.products=Array.isArray(res.products)?res.products:[];
  }catch(e){
    state.products=fallbackProducts;
  }
  renderProducts();
}

function renderProducts(){
  const q=norm($('productSearch').value);
  const list=state.products.filter(p=>{
    if(p.status==='OCULTO'||p.estado==='OCULTO') return false;
    return !q||norm(p.name||p.nombre).includes(q);
  }).slice(0,30);

  $('productList').innerHTML=list.map(p=>{
    const id=p.id;
    const name=p.name||p.nombre;
    const price=Number(p.price??p.precio??0);
    const stock=p.stock;
    const status=p.status||p.estado||'';
    const disabled=status==='SIN STOCK';
    return `<div class="product-row">
      <div class="product-thumb">🍨</div>
      <div>
        <div class="product-name">${name}</div>
        <div class="product-price">${money(price)}${stock!=null?` · stock ${stock}`:''}</div>
      </div>
      <button class="plus-btn" ${disabled?'disabled':''} onclick="addProduct('${String(id).replace(/'/g,"\\'")}')">${disabled?'×':'+'}</button>
    </div>`;
  }).join('') || '<p class="helper">No encontré productos.</p>';
}

function addProduct(id){
  const p=state.products.find(x=>String(x.id)===String(id));
  if(!p) return;
  const name=p.name||p.nombre;
  const price=Number(p.price??p.precio??0);
  const existing=state.cart.find(x=>String(x.id)===String(id)&&!x.extra);
  if(existing) existing.qty++;
  else state.cart.push({id,name,price,qty:1,extra:false});
  renderAll();
}

function addExtra(id){
  const e=extras.find(x=>x.id===id);
  if(!e) return;
  const existing=state.cart.find(x=>x.id===id&&x.extra);
  if(existing) existing.qty++;
  else state.cart.push({id:e.id,name:e.name,price:e.price,qty:1,extra:true,type:e.type});
  renderAll();
}

function changeQty(index,delta){
  const item=state.cart[index];
  if(!item) return;
  item.qty+=delta;
  if(item.qty<=0) state.cart.splice(index,1);
  renderAll();
}

function cartTotals(){
  const productTotal=state.cart.filter(x=>!x.extra).reduce((a,x)=>a+x.price*x.qty,0);
  const extraProductTotal=state.cart.filter(x=>x.extra&&x.type!=='sauce').reduce((a,x)=>a+x.price*x.qty,0);

  const sauceQty=state.cart.filter(x=>x.extra&&x.type==='sauce').reduce((a,x)=>a+x.qty,0);
  const potQty=state.cart.filter(x=>!x.extra && /¼|1\/4|½|1\/2|1 kg|2 kg|250|500/i.test(x.name)).reduce((a,x)=>a+x.qty,0);
  const paidSauces=Math.max(0,sauceQty-potQty);
  const sauceTotal=paidSauces*1500;

  const subtotal=productTotal+extraProductTotal+sauceTotal;
  const total=subtotal+Number(state.shipping.cost||0);
  return {subtotal,total,sauceQty,potQty,paidSauces};
}

function renderCart(){
  $('cartList').innerHTML=state.cart.filter(x=>!x.extra).map((x)=>{
    const index=state.cart.indexOf(x);
    return `<div class="cart-item">
      <div class="product-thumb">🍨</div>
      <div>
        <div class="product-name">${x.name}</div>
        <div class="product-price">${money(x.price)}</div>
      </div>
      <div class="qty-controls">
        <button onclick="changeQty(${index},-1)">−</button>
        <span>${x.qty}</span>
        <button onclick="changeQty(${index},1)">+</button>
      </div>
    </div>`;
  }).join('') || '<p class="helper">Todavía no agregaste productos.</p>';

  $('extrasGrid').innerHTML=extras.map(e=>{
    const current=state.cart.find(x=>x.id===e.id&&x.extra);
    return `<button class="extra-card ${e.type==='sauce'?'sauce':''}" onclick="addExtra('${e.id}')">
      + ${e.name}
      <small>${e.type==='sauce'?'1 gratis por pote; luego $1.500':money(e.price)}${current?` · x${current.qty}`:''}</small>
    </button>`;
  }).join('');
}

function renderAll(){
  const t=cartTotals();
  const count=state.cart.reduce((a,x)=>a+x.qty,0);
  $('cartCount').textContent=`(${count})`;
  $('cartMiniTotal').textContent=money(t.total);
  $('cartScreenTotal').textContent=money(t.total);
  $('summaryProducts').textContent=money(t.subtotal);
  $('summaryShipping').textContent=money(state.shipping.cost||0);
  $('summaryTotal').textContent=money(t.total);

  const cash=Number($('cashGiven')?.value||0);
  if($('changeAmount')) $('changeAmount').textContent=money(Math.max(0,cash-t.total));

  renderCart();
  renderDeliveryPreview();
}

function buildOrder(){
  const t=cartTotals();
  return {
    canal:'GitHub Panel',
    cliente:$('customerName').value.trim(),
    telefono:$('customerPhone').value.trim(),
    direccion:$('customerAddress').value.trim(),
    referencias:$('customerRefs').value.trim(),
    con_envio:$('hasDelivery').checked,
    distancia_km:state.shipping.km??'',
    costo_envio:state.shipping.cost||0,
    maps_link:state.shipping.maps||'',
    medio_pago:$('paymentMethod').value,
    transferencia_pagada:$('paymentMethod').value==='Transferencia' ? $('transferPaid').value : '',
    paga_con:$('paymentMethod').value==='Efectivo' ? Number($('cashGiven').value||0) : '',
    vuelto:$('paymentMethod').value==='Efectivo' ? Math.max(0,Number($('cashGiven').value||0)-t.total) : 0,
    notas:$('orderNotes').value.trim(),
    items:state.cart.filter(x=>!x.extra).map(x=>({id:x.id,nombre:x.name,precio:x.price,cantidad:x.qty})),
    extras:state.cart.filter(x=>x.extra).map(x=>({id:x.id,nombre:x.name,precio:x.price,cantidad:x.qty,tipo:x.type})),
    subtotal:t.subtotal,
    total:t.total
  };
}

async function quoteAddress(address){
  if(!address) throw new Error('Ingresá la dirección.');
  const res=await api('quote',{address});
  if(!res.ok) throw new Error(res.error||'No pude calcular el envío.');
  return res;
}

$('quoteDeliveryBtn').addEventListener('click',async()=>{
  try{
    const r=await quoteAddress($('customerAddress').value.trim());
    state.shipping={km:Number(r.km),cost:r.costo==null?0:Number(r.costo),time:r.duracion||'',maps:r.maps||''};
    $('shippingKm').textContent=`${Number(r.km).toFixed(1)} km`;
    $('shippingTime').textContent=r.duracion||'—';
    $('shippingPrice').textContent=r.costo==null?'Consultar':money(r.costo);
    $('shippingResultCard').classList.remove('hidden');
    renderAll();
  }catch(e){ alert(e.message); }
});

$('quickQuoteBtn').addEventListener('click',async()=>{
  try{
    const r=await quoteAddress($('quoteAddress').value.trim());
    $('quickQuotePrice').textContent=r.costo==null?'Consultar':money(r.costo);
    $('quickQuoteKm').textContent=`${Number(r.km).toFixed(1)} km`;
    $('quickQuoteTime').textContent=r.duracion||'—';
    $('quickQuoteMaps').href=r.maps||'#';
    $('quickQuoteResult').classList.remove('hidden');
  }catch(e){ alert(e.message); }
});

$('hasDelivery').addEventListener('change',()=>{
  $('deliveryFields').classList.toggle('hidden',!$('hasDelivery').checked);
  if(!$('hasDelivery').checked) state.shipping={km:null,cost:0,time:'',maps:''};
  renderAll();
});

$('paymentMethod').addEventListener('change',()=>{
  const transfer=$('paymentMethod').value==='Transferencia';
  $('cashBox').classList.toggle('hidden',transfer);
  $('transferBox').classList.toggle('hidden',!transfer);
  renderAll();
});
$('cashGiven').addEventListener('input',renderAll);

$('productSearch').addEventListener('input',renderProducts);
$('viewCartBtn').addEventListener('click',()=>go('cart'));
$('clearCartBtn').addEventListener('click',()=>{state.cart=[];renderAll();});

$('confirmOrderBtn').addEventListener('click',async()=>{
  const order=buildOrder();
  if(!order.items.length){ alert('Agregá al menos un producto.'); return; }
  if(order.con_envio && (!order.cliente||!order.telefono||!order.direccion)){ alert('Completá nombre, teléfono y dirección.'); return; }
  if(order.con_envio && state.shipping.km==null){ alert('Primero calculá el envío.'); return; }

  $('saveStatus').textContent='Guardando...';
  try{
    const res=await api('saveOrder',order);
    if(!res.ok) throw new Error(res.error||'No pude guardar el pedido.');
    state.lastOrder=order;
    $('saveStatus').textContent='Pedido guardado ✅';
    if(Array.isArray(res.products)) state.products=res.products;
    renderAll();
  }catch(e){
    $('saveStatus').textContent='';
    alert(e.message);
  }
});

function renderDeliveryPreview(){
  if(!$('deliveryPreview')) return;
  const d=state.lastOrder||buildOrder();
  if(!d.con_envio){
    $('deliveryPreview').textContent='Todavía no hay un pedido con envío listo.';
    return;
  }
  const pay=d.medio_pago==='Transferencia'
    ? (d.transferencia_pagada==='Sí'?'Transferencia · YA PAGADO':'Transferencia · verificar/cobrar')
    : `Efectivo · cobra ${money(d.total)} · paga con ${money(d.paga_con)} · vuelto ${money(d.vuelto)}`;

  $('deliveryPreview').textContent=
`🍦 DULCE MORA · NUEVO ENVÍO

Cliente: ${d.cliente||'-'}
Tel: ${d.telefono||'-'}
Dirección: ${d.direccion||'-'}
Referencias: ${d.referencias||'-'}

Envío: ${money(d.costo_envio)}
TOTAL A COBRAR: ${money(d.total)}

${pay}

📍 Maps:
${d.maps_link||''}`;
}

$('saveDeliveryNumberBtn').addEventListener('click',()=>{
  localStorage.setItem('dm_delivery_wa',$('deliveryWhatsApp').value.trim());
  alert('Número guardado ✅');
});

$('sendWhatsAppBtn').addEventListener('click',()=>{
  const number=(localStorage.getItem('dm_delivery_wa')||$('deliveryWhatsApp').value||'').replace(/\D/g,'');
  if(!number){ alert('Guardá el número del delivery en Más.'); return; }
  const msg=$('deliveryPreview').textContent;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`,'_blank');
});

$('saveExpenseBtn').addEventListener('click',async()=>{
  const data={
    fecha:$('expenseDate').value,
    tipo:$('expenseType').value,
    categoria:$('expenseCategory').value,
    proveedor:$('expenseSupplier').value.trim(),
    concepto:$('expenseConcept').value.trim(),
    importe:Number($('expenseAmount').value||0),
    medio_pago:$('expensePayment').value,
    notas:$('expenseNotes').value.trim()
  };
  try{
    const res=await api('saveExpense',data);
    if(!res.ok) throw new Error(res.error||'No pude guardar.');
    $('expenseStatus').textContent='Guardado ✅';
  }catch(e){ alert(e.message); }
});

$('loadClosingBtn').addEventListener('click',async()=>{
  try{
    const res=await api('closing',{month:$('closingMonth').value});
    if(!res.ok) throw new Error(res.error||'No pude calcular.');
    $('closingSales').textContent=money(res.ventas);
    $('closingExpenses').textContent=money(res.gastos);
    $('closingDebts').textContent=money(res.deudas);
    $('closingResult').textContent=money(res.resultado);
    $('debtsList').innerHTML=(res.detalle_deudas||[]).map(d=>
      `<div class="debt-item"><b>${d.concepto||'Deuda'}</b><br><small>${d.proveedor||''}</small><br>${money(d.importe)}</div>`
    ).join('')||'<p class="helper">No hay deudas pendientes.</p>';
  }catch(e){ alert(e.message); }
});

function openSheet(){ window.open(SHEET_URL,'_blank'); }
$('openSheetBtn').addEventListener('click',openSheet);
$('openSheetBtn2').addEventListener('click',openSheet);

function initDates(){
  const now=new Date();
  const iso=now.toISOString().slice(0,10);
  $('expenseDate').value=iso;
  $('closingMonth').value=iso.slice(0,7);
  $('deliveryWhatsApp').value=localStorage.getItem('dm_delivery_wa')||'';
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

initDates();
loadProducts();
renderAll();
