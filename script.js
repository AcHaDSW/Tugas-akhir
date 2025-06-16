const productListEl = document.getElementById('product-list');
const orderListEl = document.getElementById('order-list');
const paymentForm = document.getElementById('payment-form');
const checkoutBtn = document.getElementById('checkout-btn');
const totalAmountEl = document.getElementById("total-amount");

let products = [];
let orders = [];

// --- Buat elemen pencarian dan filter ---
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Cari menu...";
searchInput.style.marginBottom = "1rem";
document.getElementById("menu-section").prepend(searchInput);

const filterSelect = document.createElement("select");
filterSelect.innerHTML = `
  <option value="all">Semua</option>
  <option value="makanan">Makanan</option>
  <option value="minuman">Minuman</option>
  <option value="snack">Snack</option>
`;
filterSelect.style.margin = "0 0 1rem 10px";
searchInput.insertAdjacentElement("afterend", filterSelect);

// --- Load menu dari JSON ---
async function loadMenu() {
  try {
    const [resMakanan, resMinuman,resSnack] = await Promise.all([
      fetch('menuMakanan.json'),
      fetch('menuMinuman.json'),
      fetch('menuSnack.json')
    ]);

    const makanan = await resMakanan.json();
    const minuman = await resMinuman.json();
    const snack = await resSnack.json();

    products = [
      ...makanan.map(item => ({ ...item, jenis: "makanan" })),
      ...minuman.map(item => ({ ...item, jenis: "minuman" })),
      ...snack.map(item => ({ ...item, jenis: "snack" }))
    ];

    displayProducts(products);
  } catch (error) {
    productListEl.innerHTML = '<p>Gagal memuat menu.</p>';
    console.error('Error loading menu:', error);
  }
}

// --- Tampilkan menu sesuai hasil filter dan pencarian ---
function displayProducts(menuList) {
  productListEl.innerHTML = '';
  menuList.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="img/${product.image || 'img'}" alt="${product.nama}" />
      <h3>${product.nama}</h3>
      <p class="description">${product.deskripsi}</p>
      <div class="price">Rp ${product.harga.toLocaleString('id-ID')}</div>
      <button onclick="addToOrder(${product.id})">Tambah Pesanan</button>
    `;
    productListEl.appendChild(card);
  });
}

// --- Tambah ke pesanan ---
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

// --- Hapus dari pesanan ---
function removeFromOrder(productId) {
  const index = orders.findIndex(o => o.id === productId);
  if (index !== -1) {
    orders.splice(index, 1);
    renderOrderList();
  }
}

// --- Tampilkan daftar pesanan ---
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

// --- Hitung total harga ---
function hitungTotal() {
  const total = orders.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  totalAmountEl.textContent = total.toLocaleString('id-ID');
}

// --- Checkout ---
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

  orders = [];
  renderOrderList();
  paymentForm.reset();
});

// --- Tampilkan opsi bank/e-wallet sesuai pilihan ---
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

// --- Filter dan cari menu ---
function filterAndSearch() {
  const keyword = searchInput.value.toLowerCase();
  const filter = filterSelect.value;

  const filtered = products.filter(menu => {
    const matchKeyword = menu.nama.toLowerCase().includes(keyword);
    const matchType = filter === "all" || menu.jenis === filter;
    return matchKeyword && matchType;
  });

  displayProducts(filtered);
}

searchInput.addEventListener("input", filterAndSearch);
filterSelect.addEventListener("change", filterAndSearch);

// --- Jalankan saat halaman dimuat ---
window.addEventListener('DOMContentLoaded', loadMenu);
