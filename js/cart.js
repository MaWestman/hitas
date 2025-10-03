// Enkel handlekurv-funksjonalitet
function addToCart(name, price) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push({ name, price });
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(name + " er lagt til i handlekurven.");
}

window.onload = function () {
  const cartItems = document.getElementById('cart-items');
  const totalPrice = document.getElementById('total-price');
  if (cartItems && totalPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;
    cartItems.innerHTML = '';
    cart.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name + " - kr " + item.price;
      cartItems.appendChild(li);
      total += item.price;
    });
    totalPrice.textContent = "Total: kr " + total;
  }
};
