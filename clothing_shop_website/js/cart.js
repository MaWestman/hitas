function addToCart(name, price) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push({ name, price });
  localStorage.setItem('cart', JSON.stringify(cart));
}

window.onload = function() {
  const cartItems = document.getElementById('cart-items');
  const totalPrice = document.getElementById('total-price');
  if (cartItems && totalPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;
    cartItems.innerHTML = '';
    cart.forEach(item => {
      cartItems.innerHTML += `<p>${item.name} - $${item.price.toFixed(2)}</p>`;
      total += item.price;
    });
    totalPrice.textContent = total.toFixed(2);
  }
};