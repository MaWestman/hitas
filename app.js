// --- Minimal product data (in SEK) ---
const PRODUCTS = [
  {id: 'w1', name: 'Ribbed Knit Sweater', price: 299, category: 'Women', type: 'Clothing', sizes:['XS','S','M','L','XL'], image: 'assets/img/placeholder.png'},
  {id: 'w2', name: 'High Waist Jeans', price: 399, category: 'Women', type: 'Clothing', sizes:['24','26','28','30','32'], image: 'assets/img/placeholder.png'},
  {id: 'm1', name: 'Crewneck T‑Shirt', price: 129, category: 'Men', type: 'Clothing', sizes:['S','M','L','XL'], image: 'assets/img/placeholder.png'},
  {id: 'm2', name: 'Chino Pants', price: 349, category: 'Men', type: 'Clothing', sizes:['S','M','L','XL'], image: 'assets/img/placeholder.png'},
  {id: 'k1', name: 'Kids Hoodie', price: 199, category: 'Kids', type: 'Clothing', sizes:['98','104','110','116'], image: 'assets/img/placeholder.png'},
  {id: 'a1', name: 'Leather Belt', price: 179, category: 'Accessories', type: 'Accessories', sizes:['S','M','L'], image: 'assets/img/placeholder.png'},
  {id: 'a2', name: 'Beanie Hat', price: 99, category: 'Accessories', type: 'Accessories', sizes:['One Size'], image: 'assets/img/placeholder.png'}
];

// --- Utilities ---
const kr = v => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(v);
const qs = (sel, el=document) => el.querySelector(sel);
const qsa = (sel, el=document) => [...el.querySelectorAll(sel)];

const Cart = {
  key: 'mvp_cart',
  read(){ try{ return JSON.parse(localStorage.getItem(this.key) || '[]'); }catch{ return []; } },
  write(items){ localStorage.setItem(this.key, JSON.stringify(items)); updateCartCount(); },
  add(productId, size, qty=1){
    const items = this.read();
    const idx = items.findIndex(i => i.productId===productId && i.size===size);
    if(idx>-1){ items[idx].qty += qty; } else { items.push({productId, size, qty}); }
    this.write(items);
  },
  setQty(productId, size, qty){
    let items = this.read();
    items = items.map(i => (i.productId===productId && i.size===size) ? {...i, qty: Math.max(1, qty)} : i);
    this.write(items);
  },
  remove(productId, size){ this.write(this.read().filter(i => !(i.productId===productId && i.size===size))); },
  clear(){ this.write([]); }
}

function updateCartCount(){
  const count = Cart.read().reduce((sum,i)=>sum+i.qty,0);
  const badge = qs('#cartCount'); if(badge) badge.textContent = count;
}

// --- Router ---
function parseQuery(q){ const params = new URLSearchParams(q || ''); return Object.fromEntries(params.entries()); }
function route(){
  const hash = location.hash || '#/'
  const main = qs('#app'); if(!main) return; main.innerHTML = '';
  const [path, query=''] = hash.slice(2).split('?');
  const params = parseQuery(query);
  switch(true){
    case path === '' : renderHome(main); break;
    case path === 'catalog': renderCatalog(main, params); break;
    case path.startsWith('product/') : renderProduct(main, path.split('/')[1]); break;
    case path === 'cart': renderCart(main); break;
    case path === 'checkout': renderCheckout(main); break;
    case path === 'confirmation': renderConfirmation(main, params.orderId); break;
    case path === 'search': renderSearch(main, params.q || ''); break;
    default: main.textContent = 'Not found';
  }
  main.focus();
}

// --- Renderers ---
function renderHome(root){
  root.innerHTML = `
    <section class="hero">
      <div class="hero-card">
        <div>
          <h1>New In: Autumn Staples</h1>
          <p>A clean, minimal shop experience inspired by Scandinavian retail design.</p>
          <div class="cta">
            <a class="button brand" href="#/catalog">Shop all</a>
            <a class="button" href="#/catalog?category=Women">Women</a>
            <a class="button" href="#/catalog?category=Men">Men</a>
          </div>
        </div>
        <img src="assets/img/placeholder.png" alt="Featured collection" style="max-width:220px;border:1px solid var(--border)"/>
      </div>
    </section>

    <section>
      <h2>Shop by category</h2>
      <div class="categories">
        ${['Women','Men','Kids','Accessories'].map(c => `
          <article class="category-tile">
            <div class="inner">
              <h3>${c}</h3>
              <a class="button" href="#/catalog?category=${encodeURIComponent(c)}">Explore</a>
            </div>
          </article>
        `).join('')}
      </div>
    </section>

    <section>
      <h2>Featured</h2>
      <div class="grid">
        ${PRODUCTS.slice(0,6).map(p=>Card(p)).join('')}
      </div>
    </section>
  `;
}

function renderCatalog(root, params){
  const category = params.category || 'All';
  const type = params.type || 'All';
  const filtered = PRODUCTS.filter(p => (category==='All' || p.category===category) && (type==='All' || p.type===type));
  root.innerHTML = `
    <h1>Catalog</h1>
    <div class="filters" role="tablist" aria-label="Categories">
      ${['All','Women','Men','Kids','Accessories'].map(c=>`<button class="chip ${c===category?'active':''}" onclick="location.hash='#/catalog?category=${encodeURIComponent(c)}'">${c}</button>`).join('')}
    </div>
    <div class="filters" aria-label="Types">
      ${['All','Clothing','Accessories'].map(t=>`<button class="chip ${t===type?'active':''}" onclick="location.hash='#/catalog?category=${encodeURIComponent(category)}&type=${encodeURIComponent(t)}'">${t}</button>`).join('')}
    </div>
    <div class="grid">${filtered.map(p=>Card(p)).join('')}</div>
  `;
}

function renderProduct(root, id){
  const p = PRODUCTS.find(x => x.id===id);
  if(!p){ root.textContent = 'Product not found'; return; }
  let selectedSize = p.sizes[0];
  root.innerHTML = `
    <div class="product">
      <div class="media"><img src="${p.image}" alt="${p.name}"/></div>
      <div class="info">
        <h1>${p.name}</h1>
        <p class="price">${kr(p.price)}</p>
        <div>
          <strong>Size</strong>
          <div class="sizes">${p.sizes.map(s=>`<button class="size ${s===selectedSize?'selected':''}" data-size="${s}">${s}</button>`).join('')}</div>
        </div>
        <div class="qty" style="margin:12px 0">
          <button id="minus">-</button>
          <span id="qty">1</span>
          <button id="plus">+</button>
        </div>
        <button id="addToCart" class="button brand" style="width:100%">Add to cart</button>
        <p class="notice" style="margin-top:12px">MVP demo — no real payments.</p>
      </div>
    </div>
  `;
  let qty = 1;
  qs('#plus').onclick = ()=>{ qty++; qs('#qty').textContent = qty; };
  qs('#minus').onclick = ()=>{ qty = Math.max(1, qty-1); qs('#qty').textContent = qty; };
  qsa('.size').forEach(btn=>{ btn.addEventListener('click', ()=>{ selectedSize = btn.dataset.size; qsa('.size').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); }); });
  qs('#addToCart').onclick = ()=>{ Cart.add(p.id, selectedSize, qty); location.hash = '#/cart'; }
}

function renderCart(root){
  const items = Cart.read();
  const withProducts = items.map(i => ({...i, product: PRODUCTS.find(p=>p.id===i.productId)})).filter(x=>x.product);
  const subtotal = withProducts.reduce((sum,i)=> sum + i.product.price * i.qty, 0);
  if(withProducts.length===0){ root.innerHTML = `<h1>Your cart</h1><p>Your cart is empty.</p><a class="button" href="#/catalog">Continue shopping</a>`; return; }
  root.innerHTML = `
    <h1>Your cart</h1>
    <div class="cart">
      <div>
        ${withProducts.map(i=>`
          <div class="cart-item">
            <img src="${i.product.image}" alt="${i.product.name}"/>
            <div>
              <div class="title">${i.product.name}</div>
              <div class="muted">Size ${i.size}</div>
              <div class="qty" style="margin-top:8px">
                <button aria-label="Decrease" onclick="updateItemQty('${i.product.id}','${i.size}',${i.qty-1})">-</button>
                <span>${i.qty}</span>
                <button aria-label="Increase" onclick="updateItemQty('${i.product.id}','${i.size}',${i.qty+1})">+</button>
                <button style="margin-left:12px" onclick="removeItem('${i.product.id}','${i.size}')">Remove</button>
              </div>
            </div>
            <div class="price">${kr(i.product.price * i.qty)}</div>
          </div>
        `).join('')}
      </div>
      <aside class="cart-summary">
        <div class="row"><span>Subtotal</span><strong>${kr(subtotal)}</strong></div>
        <div class="row"><span>Shipping</span><span>Calculated at checkout</span></div>
        <hr />
        <div class="row"><span>Total</span><strong>${kr(subtotal)}</strong></div>
        <a class="button brand" style="display:block;text-align:center;margin-top:12px" href="#/checkout">Checkout</a>
      </aside>
    </div>
  `;
}

window.updateItemQty = (productId, size, qty)=>{ Cart.setQty(productId, size, qty); route(); }
window.removeItem = (productId, size)=>{ Cart.remove(productId, size); route(); }

function renderCheckout(root){
  const items = Cart.read(); if(items.length===0){ location.hash = '#/cart'; return; }
  const total = items.reduce((sum,i)=>{ const p = PRODUCTS.find(x=>x.id===i.productId); return sum + (p?p.price:0)*i.qty; }, 0);
  root.innerHTML = `
    <h1>Checkout</h1>
    <div class="cart">
      <form id="checkoutForm" class="form">
        <div class="input"><label for="email">Email</label><input id="email" name="email" type="email" required placeholder="you@example.com" /></div>
        <div class="input"><label for="name">Full name</label><input id="name" name="name" required placeholder="First Last" /></div>
        <div class="input"><label for="address">Address</label><input id="address" name="address" required placeholder="Street 1" /></div>
        <div class="grid-2">
          <div class="input"><label for="postal">Postal code</label><input id="postal" name="postal" required placeholder="123 45" /></div>
          <div class="input"><label for="city">City</label><input id="city" name="city" required placeholder="City" /></div>
        </div>
        <div class="input"><label for="country">Country</label>
          <select id="country" name="country" required>
            <option value="SE" selected>Sweden</option>
            <option value="NO">Norway</option>
            <option value="FI">Finland</option>
            <option value="DK">Denmark</option>
          </select>
        </div>
        <div class="notice">Guest checkout — no account needed.</div>
        <h3>Payment</h3>
        <div class="grid-2">
          <div class="input"><label for="card">Card number</label><input id="card" name="card" inputmode="numeric" minlength="12" maxlength="19" placeholder="4242 4242 4242 4242" required /></div>
          <div class="input"><label for="exp">Expiry (MM/YY)</label><input id="exp" name="exp" placeholder="12/28" pattern="^(0[1-9]|1[0-2])\\/(\\d{2})$" required /></div>
        </div>
        <div class="grid-2">
          <div class="input"><label for="cvv">CVV</label><input id="cvv" name="cvv" inputmode="numeric" minlength="3" maxlength="4" required /></div>
          <div class="input"><label for="nameOnCard">Name on card</label><input id="nameOnCard" name="nameOnCard" required /></div>
        </div>
        <button class="button brand" type="submit">Place order (${kr(total)})</button>
        <p class="muted">Demo only — payment is not processed.</p>
      </form>
      <aside class="cart-summary">
        <h3>Order summary</h3>
        ${items.map(i=>{const p=PRODUCTS.find(x=>x.id===i.productId);return `<div class='row'><span>${p?p.name:'Item'} × ${i.qty}</span><span>${kr((p?p.price:0)*i.qty)}</span></div>`}).join('')}
        <hr /><div class="row"><strong>Total</strong><strong>${kr(total)}</strong></div>
      </aside>
    </div>`;
  qs('#checkoutForm').addEventListener('submit', (e)=>{ e.preventDefault(); const orderId = Math.random().toString(36).slice(2,8).toUpperCase(); Cart.clear(); location.hash = `#/confirmation?orderId=${orderId}`; });
}

function renderConfirmation(root, orderId){ root.innerHTML = `<h1>Thank you!</h1><p>Your order <strong>#${orderId || 'N/A'}</strong> has been placed.</p><a class="button" href="#/catalog">Continue shopping</a>`; }

function renderSearch(root, q){ const key = (q||'').toLowerCase(); const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(key) || p.category.toLowerCase().includes(key) || p.type.toLowerCase().includes(key)); root.innerHTML = `<h1>Search</h1><p>Results for "${q}" — ${results.length} found</p><div class="grid">${results.map(p=>Card(p)).join('')}</div>`; }

function Card(p){ return `<article class="card"><a href="#/product/${p.id}"><img src="${p.image}" alt="${p.name}"><div class="body"><h3 class="title">${p.name}</h3><div class="price">${kr(p.price)}</div></div></a></article>`; }

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
  route(); updateCartCount(); const y = new Date().getFullYear(); const yEl = document.getElementById('year'); if(yEl) yEl.textContent = y;
  const form = document.getElementById('searchForm'); form.addEventListener('submit', (e)=>{ e.preventDefault(); const q = document.getElementById('searchInput').value.trim(); location.hash = `#/search?q=${encodeURIComponent(q)}`; });
});
