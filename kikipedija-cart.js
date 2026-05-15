/* ═══════════════════════════════════════════════════════════
   kikipedija-cart.js  –  košarica
═══════════════════════════════════════════════════════════ */

/* ── POMOĆNE FUNKCIJE ──────────────────────────────────────── */
function kikiGetCart() {
  try { return JSON.parse(localStorage.getItem('kiki_cart') || '[]'); }
  catch(e) { return []; }
}

function kikiSaveCart(cart) {
  localStorage.setItem('kiki_cart', JSON.stringify(cart));
}

function kikiUpdateBadge() {
  var cart = kikiGetCart();
  var total = 0;
  for (var i = 0; i < cart.length; i++) total += cart[i].qty;
  var badges = document.querySelectorAll('.cart-badge');
  for (var b = 0; b < badges.length; b++) {
    badges[b].textContent = total;
    badges[b].style.display = 'inline-flex';
  }
}

function kikiEsc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function kikiToast(msg) {
  var t = document.getElementById('kiki-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'kiki-toast';
    t.className = 'kiki-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'kiki-toast ok';
  clearTimeout(t._hide);
  t._hide = setTimeout(function() { t.className = 'kiki-toast'; }, 2500);
}

/* ── KOŠARICA STRANICA ─────────────────────────────────────── */
function kikiRenderCart() {
  var wrap     = document.getElementById('cart-items-wrap');
  var emptyMsg = document.getElementById('cart-empty-msg');
  var formSec  = document.getElementById('order-form-section');
  var totalEl  = document.getElementById('cart-total');

  if (!wrap) return; /* nismo na kosarica.html */

  var cart = kikiGetCart();

  if (cart.length === 0) {
    wrap.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (formSec)  formSec.style.display  = 'none';
    if (totalEl)  totalEl.textContent    = '€0,00';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (formSec)  formSec.style.display  = 'block';

  var html   = '';
  var ukupno = 0;
  for (var i = 0; i < cart.length; i++) {
    var item     = cart[i];
    var subtotal = item.cijena * item.qty;
    ukupno += subtotal;
    html +=
      '<div class="cart-item-row">' +
        '<div class="cart-item-info">' +
          '<span class="cart-item-name">' + kikiEsc(item.naziv) + '</span>' +
          '<span class="cart-item-qty">&times; ' + item.qty + '</span>' +
        '</div>' +
        '<div class="cart-item-right">' +
          '<span class="cart-item-price">&euro;' + subtotal.toFixed(2).replace('.', ',') + '</span>' +
          '<button class="cart-remove-btn" data-idx="' + i + '" title="Ukloni">&times;</button>' +
        '</div>' +
      '</div>';
  }

  wrap.innerHTML = html;
  if (totalEl) totalEl.textContent = '\u20ac' + ukupno.toFixed(2).replace('.', ',');

  var btns = wrap.querySelectorAll('.cart-remove-btn');
  for (var b = 0; b < btns.length; b++) {
    btns[b].addEventListener('click', function() {
      var idx = parseInt(this.getAttribute('data-idx'));
      var c   = kikiGetCart();
      c.splice(idx, 1);
      kikiSaveCart(c);
      kikiUpdateBadge();
      kikiRenderCart();
    });
  }
}

/* ── DODAVANJE IZ PROIZVODI.HTML ───────────────────────────── */
var forms = document.querySelectorAll('.size-form');
for (var f = 0; f < forms.length; f++) {
  forms[f].addEventListener('submit', function(e) {
    e.preventDefault();
    var form   = e.currentTarget;
    var naziv  = form.querySelector('[name="proizvod"]').value;
    var cijena = parseFloat(form.querySelector('[name="cijena"]').value);
    var radio  = form.querySelector('input[type="radio"]:checked');
    if (!radio) return;

    var cart  = kikiGetCart();
    var key   = naziv + '|' + radio.value;
    var found = false;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].key === key) { cart[i].qty++; found = true; break; }
    }
    if (!found) cart.push({ key: key, naziv: naziv, cijena: cijena, qty: 1 });

    kikiSaveCart(cart);
    kikiUpdateBadge();
    kikiToast('\u2713 Dodano: ' + naziv);

    if (history.pushState) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    } else {
      window.location.hash = '#';
    }
  });
}

/* ── NARUDŽBA SUBMIT ───────────────────────────────────────── */
var orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    kikiSaveCart([]);
    kikiUpdateBadge();
    var formSec = document.getElementById('order-form-section');
    var wrap    = document.getElementById('cart-items-wrap');
    var empty   = document.getElementById('cart-empty-msg');
    var success = document.getElementById('success-screen');
    if (formSec) formSec.style.display = 'none';
    if (wrap)    wrap.innerHTML = '';
    if (empty)   empty.style.display = 'none';
    if (success) success.style.display = 'block';
  });
}

/* ── POKRETANJE ────────────────────────────────────────────── */
kikiUpdateBadge();
kikiRenderCart();
