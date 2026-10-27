const API_URL = 'https://script.google.com/macros/s/AKfycbygO20u3jSvivUgfwkD6kVBSZv5VP4fuvTjf-ejpv4hWmnckc_24uiWbA_f-DyLyUpH/exec';
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
  {id:'p250',name:'¼ Kg',price:7500,stock:null,status:'DISPONIBLE',image:'assets/img-f6b638c7a088.webp'},
  {id:'p500',name:'½ Kg',price:10500,stock:null,status:'DISPONIBLE',image:'assets/img-d0a573bd8b62.webp'},
  {id:'p1k',name:'1 Kg',price:19000,stock:null,status:'DISPONIBLE',image:'assets/img-dbffc818c4e3.webp'},
  {id:'p2k',name:'2 Kg',price:36000,stock:null,status:'DISPONIBLE',image:'assets/img-3c8a2fede27d.webp'},
  {id:'hielo-2kg',name:'Hielo · 2 kg',price:3500,stock:null,status:'REVISAR',image:'assets/img-3e51d9755dd1.webp'},
  {id:'cucurucho-1',name:'Cucurucho',price:500,stock:null,status:'DISPONIBLE',activeWeb:false,image:'assets/cucurucho-1.png'},
  {id:'cucuruchos-4',name:'4 cucuruchos',price:1500,stock:null,status:'DISPONIBLE',activeWeb:false,image:'assets/cucuruchos-4.png'},
  {id:'banana-bites-leche',name:'Le Banana Bites · Chocolate con leche',price:10000,stock:6,status:'DISPONIBLE',image:'assets/img-f5ee8b57c72a.webp'},
  {id:'banana-bites-semi',name:'Le Banana Bites · Chocolate semi amargo',price:10000,stock:6,status:'DISPONIBLE',image:'assets/img-3508a56c8d02.webp'},
  {id:'guapa-frutilla-leche',name:'Frutilla y leche condensada',price:6500,stock:2,status:'DISPONIBLE',image:'assets/img-941a071552fd.webp'},
  {id:'guapa-choco-ddl',name:'Chocolate y dulce de leche',price:6500,stock:6,status:'DISPONIBLE',image:'assets/img-31ae7abb5f51.webp'},
  {id:'guapa-multifruta',name:'Multifruta',price:6500,stock:5,status:'DISPONIBLE',image:'assets/img-466cc9a6ab18.webp'},
  {id:'guapa-banana-split',name:'Banana Split',price:6500,stock:6,status:'DISPONIBLE',image:'assets/img-b0f702e62807.webp'},
  {id:'guapa-limon-jengibre',name:'Limonada, menta & jengibre',price:6500,stock:6,status:'DISPONIBLE',image:'assets/img-2193d38dbb6f.webp'},
  {id:'guapaleta-super-ddl',name:'Súper dulce de leche',price:6500,stock:3,status:'DISPONIBLE',image:'assets/img-9aa92b73987a.webp'},
  {id:'franui-leche',name:'Franui Leche',price:9000,stock:2,status:'DISPONIBLE',image:'assets/img-f9cd72766d6b.webp'},
  {id:'franui-pink',name:'Franui Pink',price:9000,stock:4,status:'DISPONIBLE',image:'assets/img-ce289dc2ab64.webp'},
  {id:'franui-amargo',name:'Franui Amargo',price:9000,stock:3,status:'DISPONIBLE',image:'assets/img-ab50c37699be.webp'},
  {id:'franui-free',name:'Franui Free',price:9000,stock:4,status:'DISPONIBLE',image:'assets/img-9558f2e20003.webp'},
  {id:'paleta-cuore',name:'Paleta Cuore',price:1850,stock:16,status:'DISPONIBLE',image:'assets/img-59d9accae723.webp'},
  {id:'paleta-crocante',name:'Bombón crocante',price:1200,stock:24,status:'DISPONIBLE',image:'assets/img-4e10d82e93fa.webp'},
  {id:'paleta-bombon-ddl',name:'Paleta Bombón de dulce de leche',price:1000,stock:null,status:'DISPONIBLE',image:'assets/img-22954b5cc0a2.webp'},
  {id:'paleta-crema-granizado',name:'Palito crema granizado',price:950,stock:null,status:'DISPONIBLE',image:'assets/img-866b179fdc4d.webp'},
  {id:'paleta-crema',name:'Helado de crema combinado',price:850,stock:null,status:'DISPONIBLE',image:'assets/img-d8285ff41af5.webp'},
  {id:'paleta-joy',name:'Palito Joy',price:1100,stock:20,status:'DISPONIBLE',image:'assets/img-b7809ffd3efe.webp'},
  {id:'paleta-max-bombon',name:'MAX',price:1900,stock:16,status:'DISPONIBLE',image:'assets/img-17d7c9b5da83.webp'},
  {id:'paleta-agua-frutilla',name:'Paleta al agua · Frutilla',price:500,stock:40,status:'DISPONIBLE',image:'assets/img-4ca3b544f5d2.webp'},
  {id:'paleta-agua-uva',name:'Paleta al agua · Uva',price:500,stock:40,status:'DISPONIBLE',image:'assets/img-fa71652eb04d.webp'},
  {id:'paleta-agua-limon',name:'Paleta al agua · Limón',price:500,stock:40,status:'DISPONIBLE',image:'assets/img-c0909bb1fb9a.webp'},
  {id:'paleta-agua-naranja',name:'Paleta al agua · Naranja',price:500,stock:40,status:'DISPONIBLE',image:'assets/img-a0c0c46b8d6e.webp'},
  {id:'postre-grande-cheesecake',name:'Cheesecake de frutos rojos · Grande',price:6000,stock:0,status:'SIN STOCK',image:'assets/img-bd19084b342a.webp'},
  {id:'postre-chico-flansini',name:'Flansini · Chico',price:4500,stock:0,status:'SIN STOCK',image:'assets/img-d50fe2e81a35.webp'},
  {id:'postre-chico-cheesecake',name:'Cheesecake de frutos rojos · Chico',price:4500,stock:0,status:'SIN STOCK',image:'assets/img-bd19084b342a.webp'},
  {id:'postre-chico-oreo',name:'Oreo · Chico',price:4500,stock:0,status:'SIN STOCK',image:'assets/img-a0c3fb2ee2d6.webp'},
  {id:'postre-chico-chocotorta',name:'Chocotorta · Chico',price:4500,stock:0,status:'SIN STOCK',image:'assets/img-b8d0801b04aa.webp'},
  {id:'postre-chico-lemon-pie',name:'Lemon Pie · Chico',price:4500,stock:0,status:'SIN STOCK',image:'assets/img-d99d1ace1b50.webp'},
  {id:'postre-chico-tiramisu',name:'Tiramisú · Chico',price:4500,stock:0,status:'SIN STOCK',image:'assets/img-3f66b7c993e4.webp'},
  {id:'torta-oreo',name:'Torta helada Oreo',price:22000,stock:2,status:'DISPONIBLE',image:'assets/img-312672c51ce3.webp'},
  {id:'torta-tiramisu',name:'Torta helada Tiramisú',price:28000,stock:0,status:'SIN STOCK',activeWeb:false,image:'assets/img-3f66b7c993e4.webp'},
  {id:'torta-cookies-cream',name:'Torta helada Cookies & Cream',price:28000,stock:0,status:'SIN STOCK',activeWeb:true,image:'assets/img-ed7ef4c3bad4.webp'},
  {id:'torta-chocotorta-extra',name:'Torta helada Chocotorta',price:28000,stock:0,status:'SIN STOCK',activeWeb:true,image:'assets/img-24e14767e3aa.webp'},
  {id:'torta-tartufo',name:'Torta helada Tartufo',price:22000,stock:null,status:'DISPONIBLE',image:'assets/img-b4ae299e6758.webp'},
  {id:'torta-a-frutilla',name:'Torta helada Frutilla',price:22000,stock:null,status:'DISPONIBLE',image:'assets/img-d67032b7d7fa.webp'},
  {id:'torta-a-chocotorta',name:'Torta helada Chocotorta',price:22000,stock:null,status:'DISPONIBLE',image:'assets/img-cd149b97487f.webp'},
  {id:'torta-choco-ddl',name:'Torta helada Chocotorta · Línea B',price:28000,stock:null,status:'DISPONIBLE',image:'assets/img-24e14767e3aa.webp'},
  {id:'torta-cookies-ddl',name:'Torta helada Cookies & Cream',price:28000,stock:null,status:'DISPONIBLE',image:'assets/img-ed7ef4c3bad4.webp'},
  {id:'torta-frutilla',name:'Torta helada Frutilla · Línea B',price:28000,stock:null,status:'DISPONIBLE',image:'assets/img-3bb78f29156f.webp'}
];

const $ = (id)=>document.getElementById(id);
const money = (n)=>'$'+Number(n||0).toLocaleString('es-AR');
const norm = (s)=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

const PRODUCT_IMAGES = Object.fromEntries(
  fallbackProducts.map(p => [String(p.id), p.image])
);

const NAME_IMAGE_RULES = [
  [/^1\/?4|¼|250|cuarto/i,'assets/img-f6b638c7a088.webp'],
  [/^1\/?2|½|500|medio kilo/i,'assets/img-d0a573bd8b62.webp'],
  [/^1 ?kg|^1 kilo|^kilo$/i,'assets/img-dbffc818c4e3.webp'],
  [/^2 ?kg|^2 kilos|dos kilos/i,'assets/img-3c8a2fede27d.webp'],
  [/hielo/i,'assets/img-3e51d9755dd1.webp'],
  [/franui.*leche/i,'assets/img-f9cd72766d6b.webp'],
  [/franui.*pink/i,'assets/img-ce289dc2ab64.webp'],
  [/franui.*amargo/i,'assets/img-ab50c37699be.webp'],
  [/franui.*free/i,'assets/img-9558f2e20003.webp'],
  [/banana.*leche/i,'assets/img-f5ee8b57c72a.webp'],
  [/banana.*semi|banana.*amargo/i,'assets/img-3508a56c8d02.webp'],
  [/guapa.*frutilla|frutilla.*condensada/i,'assets/img-941a071552fd.webp'],
  [/guapa.*choco|chocolate.*dulce de leche/i,'assets/img-31ae7abb5f51.webp'],
  [/multifruta/i,'assets/img-466cc9a6ab18.webp'],
  [/guapa.*banana|banana split/i,'assets/img-b0f702e62807.webp'],
  [/limonada.*jengibre|menta.*jengibre/i,'assets/img-2193d38dbb6f.webp'],
  [/guapa.*super|súper dulce de leche|super dulce de leche/i,'assets/img-9aa92b73987a.webp'],
  [/cuore/i,'assets/img-59d9accae723.webp'],
  [/crocante/i,'assets/img-4e10d82e93fa.webp'],
  [/bomb[oó]n.*dulce de leche|paleta.*ddl/i,'assets/img-22954b5cc0a2.webp'],
  [/crema granizado/i,'assets/img-866b179fdc4d.webp'],
  [/helado de crema combinado|vainilla y choco/i,'assets/img-d8285ff41af5.webp'],
  [/palito joy|\bjoy\b/i,'assets/img-b7809ffd3efe.webp'],
  [/\bmax\b/i,'assets/img-17d7c9b5da83.webp'],
  [/paleta.*frutilla/i,'assets/img-4ca3b544f5d2.webp'],
  [/paleta.*uva/i,'assets/img-fa71652eb04d.webp'],
  [/paleta.*limon/i,'assets/img-c0909bb1fb9a.webp'],
  [/paleta.*naranja/i,'assets/img-a0c0c46b8d6e.webp'],
  [/cheesecake/i,'assets/img-bd19084b342a.webp'],
  [/flansini/i,'assets/img-d50fe2e81a35.webp'],
  [/postre.*oreo|oreo.*chico/i,'assets/img-a0c3fb2ee2d6.webp'],
  [/postre.*chocotorta|chocotorta.*chico/i,'assets/img-b8d0801b04aa.webp'],
  [/lemon pie/i,'assets/img-d99d1ace1b50.webp'],
  [/tiramisu|tiramisú/i,'assets/img-3f66b7c993e4.webp'],
  [/torta.*oreo/i,'assets/img-312672c51ce3.webp'],
  [/tartufo/i,'assets/img-b4ae299e6758.webp'],
  [/cookies.*cream/i,'assets/img-ed7ef4c3bad4.webp'],
  [/torta.*frutilla/i,'assets/img-3bb78f29156f.webp'],
  [/torta.*chocotorta/i,'assets/img-24e14767e3aa.webp']
];

const SEARCH_ALIASES = {
  p250:['cuarto','un cuarto','1/4','¼','250','250g','cuarto kilo','cuarto de kilo'],
  p500:['medio kilo','medio kg','1/2','½','500','500g','medio','medio de kilo'],
  p1k:['kilo','un kilo','1 kilo','1kg','1000','1000g'],
  p2k:['dos kilos','2 kilos','2 kilo','2kg','2000','2000g']
};

function imageForProduct(p){
  const id=String(p.id||'');
  if(PRODUCT_IMAGES[id]) return PRODUCT_IMAGES[id];
  const name=String(p.name||p.nombre||'');
  const rule=NAME_IMAGE_RULES.find(([rx])=>rx.test(name));
  return rule ? rule[1] : 'assets/img-fac0f8511475.webp';
}

function levenshtein(a,b){
  a=norm(a); b=norm(b);
  const m=a.length,n=b.length;
  if(!m) return n;
  if(!n) return m;
  const prev=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){
    let cur=[i];
    for(let j=1;j<=n;j++){
      cur[j]=Math.min(
        cur[j-1]+1,
        prev[j]+1,
        prev[j-1]+(a[i-1]===b[j-1]?0:1)
      );
    }
    for(let j=0;j<=n;j++) prev[j]=cur[j];
  }
  return prev[n];
}

function tokenSimilarity(a,b){
  a=norm(a); b=norm(b);
  if(a===b) return 1;
  if(a.includes(b)||b.includes(a)) return .92;
  const longest=Math.max(a.length,b.length,1);
  return Math.max(0,1-(levenshtein(a,b)/longest));
}

function phraseScore(query,phrase){
  const q=norm(query).trim();
  const p=norm(phrase).trim();
  if(!q) return 1;
  if(p===q) return 100;
  if(p.startsWith(q)) return 90;
  if(p.includes(q)) return 82;

  const qw=q.split(/\s+/).filter(Boolean);
  const pw=p.split(/\s+/).filter(Boolean);
  if(!qw.length||!pw.length) return 0;

  let total=0;
  for(const qt of qw){
    let best=0;
    for(const pt of pw) best=Math.max(best,tokenSimilarity(qt,pt));
    total+=best;
  }
  const avg=total/qw.length;
  return avg>=.83 ? 76+avg*10 : avg>=.68 ? 55+avg*15 : 0;
}

function smartProductScore(product,query){
  const q=norm(query).trim();
  if(!q) return 1;
  const name=product.name||product.nombre||'';
  const id=String(product.id||'');
  const aliases=[
    name,
    id,
    ...(SEARCH_ALIASES[id]||[])
  ];
  return Math.max(...aliases.map(x=>phraseScore(q,x)));
}


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


function ensureManualProducts(products){
  const apiList=Array.isArray(products)?products:[];
  const byId=new Map(apiList.map(p=>[String(p.id),p]));

  // fallbackProducts is now our complete web catalog + manual cucuruchos.
  // API data wins when the same ID exists, but missing web products are never lost.
  const merged=fallbackProducts.map(base=>{
    const live=byId.get(String(base.id));
    return live ? {...base,...live,image:base.image||live.image} : {...base};
  });

  // Keep extra products that may exist only in the Sheet.
  apiList.forEach(p=>{
    if(!merged.some(x=>String(x.id)===String(p.id))){
      merged.push(p);
    }
  });

  // Cucuruchos must always exist, even though the current public web catalog
  // does not list them as standalone products.
  if(!merged.some(p=>/^cucurucho$/i.test(String(p.name||p.nombre||'')))){
    merged.push({
      id:'manual-cucurucho-1',
      name:'Cucurucho',
      price:500,
      stock:null,
      status:'DISPONIBLE',
      activeWeb:false,
      image:'assets/img-fac0f8511475.webp'
    });
  }

  if(!merged.some(p=>/4\s*cucuruchos|cuatro\s*cucuruchos/i.test(String(p.name||p.nombre||'')))){
    merged.push({
      id:'manual-cucuruchos-4',
      name:'4 cucuruchos',
      price:1500,
      stock:null,
      status:'DISPONIBLE',
      activeWeb:false,
      image:'assets/img-fac0f8511475.webp'
    });
  }

  return merged;
}
async function loadProducts(){
  try{
    if(!API_URL) throw new Error('sin api');
    const res=await api('products');
    state.products=ensureManualProducts(Array.isArray(res.products)?res.products:[]);
  }catch(e){
    state.products=ensureManualProducts(fallbackProducts);
  }
  renderProducts();
}

function renderProducts(){
  const q=$('productSearch').value.trim();

  const ranked=state.products
    .filter(p=>true)
    .map(p=>({p,score:smartProductScore(p,q)}))
    .filter(x=>!q || x.score>=55)
    .sort((a,b)=>b.score-a.score)
    .slice(0,30);

  $('productList').innerHTML=ranked.map((entry,index)=>{
    const p=entry.p;
    const id=p.id;
    const name=p.name||p.nombre;
    const price=Number(p.price??p.precio??0);
    const stock=p.stock;
    const status=p.status||p.estado||'';
    const disabled=false;
    const img=imageForProduct(p);
    const recommended=q && index===0 && entry.score>=70;

    return `<div class="product-row ${recommended?'recommended':''}">
      <div class="product-thumb product-photo"><img src="${img}" alt="${name}" onerror="this.parentElement.textContent='🍨'"></div>
      <div>
        ${recommended?'<div class="recommended-label">Te recomendamos</div>':''}
        <div class="product-name">${name}</div>
        <div class="product-price">${money(price)}${stock!=null?` · stock ${stock}`:''}</div>
        ${((Number(stock)===0)||status==='SIN STOCK')?'<div class="stock-badge">Sin stock · igual podés seleccionarlo</div>':(!p.activeWeb?'<div class="inactive-badge">No publicado en web</div>':'')}
      </div>
      <button class="plus-btn" ${disabled?'disabled':''} onclick="addProduct('${String(id).replace(/'/g,"\'")}')">${disabled?'×':'+'}</button>
    </div>`;
  }).join('') || '<p class="helper">No encontré productos. Probá escribirlo de otra forma.</p>';
}

function addProduct(id){
  const p=state.products.find(x=>String(x.id)===String(id));
  if(!p) return;
  const name=p.name||p.nombre;
  const price=Number(p.price??p.precio??0);
  const existing=state.cart.find(x=>String(x.id)===String(id)&&!x.extra);
  if(existing) existing.qty++;
  else state.cart.push({id,name,price,qty:1,extra:false,image:imageForProduct(p)});
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
      <div class="product-thumb product-photo"><img src="${imageForProduct(x)}" alt="${x.name}" onerror="this.parentElement.textContent='🍨'"></div>
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

  const extrasHTML=extras.map(e=>{
    const current=state.cart.find(x=>x.id===e.id&&x.extra);
    const img=e.id==='f1'?'assets/img-f9cd72766d6b.webp':
              e.id==='f2'?'assets/img-ce289dc2ab64.webp':
              e.id==='f3'?'assets/img-ab50c37699be.webp':
              e.id==='f4'?'assets/img-9558f2e20003.webp':'';
    return `<button class="extra-card ${e.type==='sauce'?'sauce':''}" onclick="addExtra('${e.id}')">
      ${img?`<img class="extra-thumb" src="${img}" alt="${e.name}">`:''}
      <span>+ ${e.name}</span>
      <small>${e.type==='sauce'?'1 gratis por pote; luego $1.500':money(e.price)}${current?` · x${current.qty}`:''}</small>
    </button>`;
  }).join('');

  $('extrasGrid').innerHTML=extrasHTML;
  if($('extrasGridProducts')) $('extrasGridProducts').innerHTML=extrasHTML;
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


function resetPedidoForm(){
  state.cart = [];
  state.shipping = { km:null, cost:0, time:'', maps:'' };

  $('customerName').value = '';
  $('customerPhone').value = '';
  $('customerAddress').value = '';
  $('customerRefs').value = '';
  $('cashGiven').value = '';
  $('orderNotes').value = '';
  $('hasDelivery').checked = false;
  $('deliveryFields').classList.add('hidden');
  $('shippingResultCard').classList.add('hidden');

  $('paymentMethod').value = 'Efectivo';
  $('cashBox').classList.remove('hidden');
  $('transferBox').classList.add('hidden');

  if($('transferPaid')) $('transferPaid').value = 'Sí';

  $('saveStatus').textContent = '';
  $('productSearch').value = '';

  renderProducts();
  renderAll();
}

function resetExpenseForm(){
  $('expenseSupplier').value = '';
  $('expenseConcept').value = '';
  $('expenseAmount').value = '';
  $('expenseNotes').value = '';
  $('expensePayment').value = 'Efectivo';
  $('expenseType').value = 'Gasto pagado';
  $('expenseStatus').textContent = '';
}

$('confirmOrderBtn').addEventListener('click',async()=>{
  const order=buildOrder();

  if(!order.items.length){
    alert('Agregá al menos un producto.');
    return;
  }

  if(order.con_envio && (!order.cliente||!order.telefono||!order.direccion)){
    alert('Completá nombre, teléfono y dirección.');
    return;
  }

  if(order.con_envio && state.shipping.km==null){
    alert('Primero calculá el envío.');
    return;
  }

  $('confirmOrderBtn').disabled = true;
  $('saveStatus').textContent='Guardando en Pedidos Local...';

  try{
    const res=await api('saveOrder',order);

    if(!res || res.ok!==true){
      throw new Error((res&&res.error)||'No se pudo guardar el pedido en Google Sheets.');
    }

    state.lastOrder = order;

    if(Array.isArray(res.products)){
      state.products=ensureManualProducts(res.products);
    }

    const detalle = res.firstRow
      ? `Pedido guardado en "Pedidos Local" · fila ${res.firstRow} ✅`
      : 'Pedido guardado en "Pedidos Local" ✅';

    $('saveStatus').textContent = detalle;

    alert(detalle);

    resetPedidoForm();
    go('products');

  }catch(e){
    $('saveStatus').textContent='❌ Pedido NO guardado';
    alert('No se guardó el pedido.\n\n'+e.message);
  }finally{
    $('confirmOrderBtn').disabled = false;
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

  if(!data.fecha || !data.concepto || data.importe<=0){
    alert('Completá fecha, concepto e importe.');
    return;
  }

  $('saveExpenseBtn').disabled = true;
  $('expenseStatus').textContent='Guardando en Gastos...';

  try{
    const res=await api('saveExpense',data);

    if(!res || res.ok!==true){
      throw new Error((res&&res.error)||'No se pudo guardar el gasto en Google Sheets.');
    }

    const detalle = res.row
      ? `Gasto guardado en "Gastos" · fila ${res.row} ✅`
      : 'Gasto guardado en "Gastos" ✅';

    $('expenseStatus').textContent=detalle;
    alert(detalle);

    resetExpenseForm();
    initDates();

  }catch(e){
    $('expenseStatus').textContent='❌ Gasto NO guardado';
    alert('No se guardó el gasto.\n\n'+e.message);
  }finally{
    $('saveExpenseBtn').disabled = false;
  }
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
