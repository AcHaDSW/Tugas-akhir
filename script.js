const productListEl = document.getElementById('product-list');
const orderListEl = document.getElementById('order-list');
const paymentForm = document.getElementById('payment-form');
const checkoutBtn = document.getElementById('checkout-btn');
const totalAmountEl = document.getElementById("total-amount");

let products = [];
let orders = [];

async function loadMenu() {
  try {
    const [resMakanan, resMinuman] = await Promise.all([
      fetch('menuMakanan.json'),
      fetch('menuMinuman.json')
    ]);

    const makanan = await resMakanan.json();
    const minuman = await resMinuman.json();

    products = [...makanan, ...minuman];
    displayProducts();
  } catch (error) {
    productListEl.innerHTML = '<p>Gagal memuat menu.</p>';
    console.error('Error loading menu:', error);
  }
}

function displayProducts() {
  productListEl.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="img/${product.image || 'placeholder.jpg'}" alt="${product.nama}" />
      <h3>${product.nama}</h3>
      <p class="description">${product.deskripsi}</p>
      <div class="price">Rp ${product.harga.toLocaleString('id-ID')}</div>
      <button onclick="addToOrder(${product.id})">Tambah Pesanan</button>
    `;
    productListEl.appendChild(card);
  });
}

function addToOrder(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingOrder = orders.find(o => o.id === productId);
  if (existingOrder) {
    existingOrder.quantity += 1;
  } else {
    orders.push({
      id: product.id,
      nama: product.nama,
      harga: product.harga,
      quantity: 1
    });
  }
  renderOrderList();
}

function removeFromOrder(productId) {
  const index = orders.findIndex(o => o.id === productId);
  if (index !== -1) {
    orders.splice(index, 1);
    renderOrderList();
  }
}

function renderOrderList() {
  orderListEl.innerHTML = '';
  if (orders.length === 0) {
    orderListEl.innerHTML = '<p>Belum ada pesanan.</p>';
    checkoutBtn.disabled = true;
    totalAmountEl.textContent = "0";
    return;
  }

  orders.forEach(order => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <span>${order.nama}</span>
      <span class="quantity">x${order.quantity}</span>
      <button class="remove-btn" onclick="removeFromOrder(${order.id})">Hapus</button>
    `;
    orderListEl.appendChild(orderItem);
  });

  checkoutBtn.disabled = false;
  hitungTotal();
}

function hitungTotal() {
  const total = orders.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  totalAmountEl.textContent = total.toLocaleString('id-ID');
}

checkoutBtn.addEventListener('click', () => {
  if (orders.length === 0) return;

  const selectedPayment = paymentForm.querySelector('input[name="payment"]:checked');
  if (!selectedPayment) {
    alert("Silakan pilih metode pembayaran terlebih dahulu.");
    return;
  }

  const paymentMethod = selectedPayment.value;
  const total = orders.reduce((sum, order) => sum + order.harga * order.quantity, 0);

  alert(`Pesanan Anda sedang diproses.\nTotal: Rp ${total.toLocaleString('id-ID')}\nMetode: ${paymentMethod}`);

  // Reset pesanan
  orders = [];
  renderOrderList();
  paymentForm.reset();
});

document.addEventListener("DOMContentLoaded", () => {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankOptions = document.getElementById("bank-options");
  const ewalletOptions = document.getElementById("ewallet-options");

  paymentRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "Transfer Bank") {
        bankOptions.classList.remove("hidden");
        ewalletOptions.classList.add("hidden");
      } else if (radio.value === "e-Wallet") {
        ewalletOptions.classList.remove("hidden");
        bankOptions.classList.add("hidden");
      } else {
        bankOptions.classList.add("hidden");
        ewalletOptions.classList.add("hidden");
      }
    });
  });
});

window.addEventListener('DOMContentLoaded', loadMenu);
