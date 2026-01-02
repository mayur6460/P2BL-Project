// ---------- Dummy product data ----------
const PRODUCTS = [
  {
    id: "p1",
    name: "King Runner Pro",
    brand: "King",
    category: "men",
    price: 3499,
    oldPrice: 3999,
    discount: 12,
    sizes: [6, 7, 8, 9, 10, 11],
    img: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/2ed02aa6-f39c-4c86-a028-122c2f3c3ce4/W+ZOOM+GP+CHALLENGE+1+OSAKA+HC.png",
    description:
      "Lightweight running shoe with breathable upper and responsive cushioning.",
  },
  {
    id: "p2",
    name: "Urban Flex Sneakers",
    brand: "Stride",
    category: "women",
    price: 2799,
    oldPrice: null,
    discount: null,
    sizes: [5, 6, 7, 8, 9],
    img: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_350,h_350/global/311767/04/sv01/fnd/IND/fmt/png/Galaxis-Pro-Men's-Performance-Boost-Running-Shoes",
    description:
      "Casual everyday sneakers with cushioned footbed and sleek design.",
  },
  {
    id: "p3",
    name: "TrailBlaze Hiker",
    brand: "Explorer",
    category: "men",
    price: 4599,
    oldPrice: 4999,
    discount: 8,
    sizes: [8, 9, 10, 11, 12],
    img: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/5daa00d9-afae-4125-a95c-fc71923b81c3/AIR+FORCE+1+%2707.png",
    description:
      "Rugged trail shoe with high-traction outsole and ankle support.",
  },
  {
    id: "p4",
    name: "Mini Steps - Play",
    brand: "Kiddo",
    category: "kids",
    price: 1299,
    oldPrice: null,
    discount: null,
    sizes: [1, 2, 3, 4, 5],
    img: "https://www.skechers.in/on/demandware.static/-/Sites-skechers_india/default/dw9b0a3a69/images/large/198376857561-1.jpg",
    description:
      "Playful and comfy shoes specially designed for kids' safety and fun.",
  },
  {
    id: "p5",
    name: "Elite Court Mid",
    brand: "Ace",
    category: "women",
    price: 3899,
    oldPrice: 4299,
    discount: 9,
    sizes: [6, 7, 8, 9],
    img: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/1d1a23f8-16be-4813-9e58-75812246ba62/W+AIR+ZOOM+PEGASUS+41.png",
    description:
      "Court-inspired mid shoe with supportive sole and premium look.",
  },
  {
    id: "p6",
    name: "Everyday Slip-Ons",
    brand: "ComfyCo",
    category: "men",
    price: 1999,
    oldPrice: null,
    discount: null,
    sizes: [7, 8, 9, 10],
    img: "https://www.skechers.in/on/demandware.static/-/Sites-skechers_india/default/dwd2d8ce4e/images/large/197627245768-1.jpg",
    description: "Easy slip-on shoes for quick comfort and casual outings.",
  },
];

// ---------- CART ----------
let CART = {}; // { productId: { qty, size } }

function loadCart() {
  try {
    const raw = localStorage.getItem("kingShoesCart");
    CART = raw ? JSON.parse(raw) || {} : {};
  } catch (e) {
    CART = {};
    console.error("Could not load cart:", e);
  }
}

function saveCart() {
  localStorage.setItem("kingShoesCart", JSON.stringify(CART));
}

function computeCartSummary() {
  let qty = 0;
  let total = 0;
  for (const pid in CART) {
    const entry = CART[pid];
    const product = PRODUCTS.find((p) => p.id === pid);
    if (!product) continue;
    qty += entry.qty;
    total += product.price * entry.qty;
  }
  return { qty, total };
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const cartCount = document.getElementById("cartCount");

  if (!badge && !cartCount) return;

  const { qty } = computeCartSummary();

  if (badge) {
    badge.textContent = qty;
    badge.style.display = qty > 0 ? "inline-block" : "none";
  }

  if (cartCount) {
    cartCount.textContent = qty;
    cartCount.style.display = qty > 0 ? "flex" : "none";
  }
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;
  container.innerHTML = "";
  const keys = Object.keys(CART);

  if (keys.length === 0) {
    container.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
  } else {
    keys.forEach((pid) => {
      const entry = CART[pid];
      const product = PRODUCTS.find((p) => p.id === pid);
      if (!product) return;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${product.img}" alt="${escapeHtml(
        product.name
      )}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="fw-bold">${escapeHtml(product.name)}</div>
          <div class="text-muted small">${product.brand} • Size: ${
        entry.size
      }</div>
          <div class="fw-bold text-success">₹${(
            product.price * entry.qty
          ).toLocaleString()}</div>
          <div class="text-muted small">₹${product.price.toLocaleString()} each</div>
          <div class="d-flex gap-2 align-items-center mt-2">
            <input type="number" min="1" value="${
              entry.qty
            }" data-pid="${pid}" class="form-control qty-input" style="width: 80px;">
            <button class="btn btn-sm btn-outline-danger btn-remove" data-pid="${pid}">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll(".qty-input").forEach((inp) => {
      inp.addEventListener("change", (e) => {
        const pid = e.currentTarget.dataset.pid;
        let val = parseInt(e.currentTarget.value) || 1;
        if (val < 1) val = 1;
        CART[pid].qty = val;
        saveCart();
        renderCart();
        updateCartBadge();
        updateCartTotal();
      });
    });

    container.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const pid = e.currentTarget.dataset.pid;
        delete CART[pid];
        saveCart();
        renderCart();
        updateCartBadge();
        updateCartTotal();
      });
    });
  }

  updateCartTotal();
}

function updateCartTotal() {
  const totalEl = document.getElementById("cartTotal");
  if (!totalEl) return;
  const { total } = computeCartSummary();
  totalEl.textContent = `₹${total.toLocaleString()}`;
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

// ---------- PRODUCTS ----------
function createProductCard(product) {
  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-lg-4 mb-4";

  const old = product.oldPrice
    ? `<span class="price-old">₹${product.oldPrice.toLocaleString()}</span>`
    : "";
  const discount = product.discount
    ? `<div class="badge-discount">${product.discount}% OFF</div>`
    : "";

  col.innerHTML = `
    <div class="card card-product position-relative h-100">
      ${discount}
      <div class="product-img-container">
        <img src="${product.img}" alt="${escapeHtml(
    product.name
  )}" class="product-img">
      </div>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="flex-grow-1">
            <h6 class="card-title mb-1">${escapeHtml(product.name)}</h6>
            <div class="text-muted small">${product.brand}</div>
          </div>
          <div class="text-end">
            <div class="price-new">₹${product.price.toLocaleString()}</div>
            ${old}
          </div>
        </div>
        <div class="mt-auto">
          <div class="d-flex gap-2">
            <a href="product.html?id=${
              product.id
            }" class="btn btn-outline-primary btn-sm flex-fill">View</a>
            <button class="btn btn-primary btn-sm flex-fill add-to-cart-btn" data-id="${
              product.id
            }">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
  return col;
}

function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const noEl = document.getElementById("noResults");
  if (noEl) noEl.style.display = list.length === 0 ? "block" : "none";
  list.forEach((p) => grid.appendChild(createProductCard(p)));

  grid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      addToCart(id);
    });
  });
}

// ---------- SEARCH & FILTER ----------
let CURRENT_FILTER = "all";
let CURRENT_QUERY = "";
let CURRENT_SORT = "featured";

function applySearchFilterSort() {
  let out = PRODUCTS.slice();

  // Category filter
  if (CURRENT_FILTER !== "all") {
    out = out.filter((p) => p.category === CURRENT_FILTER);
  }

  // Search query
  if (CURRENT_QUERY.trim()) {
    const q = CURRENT_QUERY.trim().toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (CURRENT_SORT === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (CURRENT_SORT === "price-desc") out.sort((a, b) => b.price - a.price);
  else if (CURRENT_SORT === "name-asc")
    out.sort((a, b) => a.name.localeCompare(b.name));
  else if (CURRENT_SORT === "name-desc")
    out.sort((a, b) => b.name.localeCompare(a.name));

  renderProducts(out);
}

// ---------- CART ACTIONS ----------
function addToCart(productId, qty = 1, size = null) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return alert("Product not found");
  if (CART[productId]) {
    CART[productId].qty += qty;
  } else {
    CART[productId] = { qty, size: size || product.sizes[0] };
  }
  saveCart();
  updateCartBadge();

  // Show success message
  showNotification(`${product.name} added to cart!`, "success");
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

// ---------- PRODUCT PAGE ----------
function renderProductPage() {
  const container = document.getElementById("productContainer");
  if (!container) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    container.innerHTML = `<div class="alert alert-warning">Product not found. <a href="index.html">Back to shop</a></div>`;
    return;
  }

  container.innerHTML = `
    <div class="row g-4">
      <div class="col-md-6">
        <div class="product-page-img-container">
          <img src="${product.img}" alt="${escapeHtml(
    product.name
  )}" class="img-fluid rounded shadow-sm">
        </div>
      </div>
      <div class="col-md-6">
        <h2>${escapeHtml(product.name)}</h2>
        <p class="text-muted">${product.brand}</p>
        <div class="mb-3">
          <span class="price-new fs-4">₹${product.price.toLocaleString()}</span>
          ${
            product.oldPrice
              ? `<span class="price-old">₹${product.oldPrice.toLocaleString()}</span>`
              : ""
          }
          ${
            product.discount
              ? `<span class="badge bg-warning ms-2">${product.discount}% OFF</span>`
              : ""
          }
        </div>
        <p>${escapeHtml(product.description)}</p>
        <div class="mb-3">
          <label class="form-label fw-bold">Size</label>
          <select id="sizeSelect" class="form-select w-auto">
            ${product.sizes
              .map((s) => `<option value="${s}">${s}</option>`)
              .join("")}
          </select>
        </div>
        <div class="mb-3 d-flex gap-2 align-items-center">
          <label class="form-label fw-bold mb-0">Quantity:</label>
          <input id="prodQty" type="number" min="1" value="1" class="form-control" style="width: 100px;" />
          <button id="prodAdd" class="btn btn-primary btn-lg">Add to Cart</button>
        </div>
        <a href="index.html" class="btn btn-outline-secondary mt-2">Back to Products</a>
      </div>
    </div>
  `;

  document.getElementById("prodAdd").addEventListener("click", () => {
    const size = document.getElementById("sizeSelect").value;
    const qty = parseInt(document.getElementById("prodQty").value) || 1;
    addToCart(product.id, qty, size);
  });
}

// ---------- UI Bindings ----------
function attachUI() {
  // Category filter buttons
  document.querySelectorAll(".category-btn, [data-filter]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".category-btn, [data-filter]")
        .forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      CURRENT_FILTER =
        e.currentTarget.dataset.category || e.currentTarget.dataset.filter;
      applySearchFilterSort();
    });
  });

  // Search inputs
  const searchInputs = [
    document.getElementById("searchInput"),
    document.getElementById("searchInputMobile"),
    document.getElementById("searchBar"),
  ];
  searchInputs.forEach((inp) => {
    if (inp) {
      inp.addEventListener("input", (e) => {
        CURRENT_QUERY = e.target.value;
        applySearchFilterSort();
      });
    }
  });

  // Sort select
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      CURRENT_SORT = e.target.value;
      applySearchFilterSort();
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const { qty, total } = computeCartSummary();
      if (qty === 0) {
        showNotification(
          "Your cart is empty. Please add products before checkout.",
          "warning"
        );
        return;
      }
      showNotification(
        `Checkout completed! Total: ₹${total.toLocaleString()}. This is a demo.`,
        "success"
      );

      // Clear cart after checkout
      CART = {};
      saveCart();
      renderCart();
      updateCartBadge();
    });
  }

  // Cart sidebar close button
  const closeCartBtn = document.getElementById("closeCartBtn");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      document.getElementById("cartSidebar").classList.remove("open");
      document.getElementById("cartOverlay").classList.remove("open");
    });
  }

  // Cart offcanvas
  const offcanvasEl = document.getElementById("cartOffcanvas");
  if (offcanvasEl) {
    offcanvasEl.addEventListener("show.bs.offcanvas", renderCart);
  }

  // Cart button for sidebar
  const cartButton = document.getElementById("cartButton");
  if (cartButton && document.getElementById("cartSidebar")) {
    cartButton.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("cartSidebar").classList.add("open");
      document.getElementById("cartOverlay").classList.add("open");
      renderCart();
    });
  }

  // Cart overlay
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => {
      document.getElementById("cartSidebar").classList.remove("open");
      document.getElementById("cartOverlay").classList.remove("open");
    });
  }

  // Auth modal functionality
  setupAuthModal();
}

// ---------- HERO SLIDER ----------
function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevArrow = document.querySelector(".prev-arrow");
  const nextArrow = document.querySelector(".next-arrow");

  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    slides[index].classList.add("active");
    dots[index].classList.add("active");

    currentSlide = index;
  }

  function nextSlide() {
    let nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startSlideShow() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopSlideShow() {
    clearInterval(slideInterval);
  }

  if (nextArrow) {
    nextArrow.addEventListener("click", function () {
      stopSlideShow();
      nextSlide();
      startSlideShow();
    });
  }

  if (prevArrow) {
    prevArrow.addEventListener("click", function () {
      stopSlideShow();
      prevSlide();
      startSlideShow();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      stopSlideShow();
      showSlide(index);
      startSlideShow();
    });
  });

  const heroSlider = document.querySelector(".hero-slider");
  if (heroSlider) {
    heroSlider.addEventListener("mouseenter", stopSlideShow);
    heroSlider.addEventListener("mouseleave", startSlideShow);
  }

  startSlideShow();
}

// ---------- INITIALIZATION ----------
document.addEventListener("DOMContentLoaded", function () {
  // Load cart from localStorage
  loadCart();

  // Update cart badge
  updateCartBadge();

  // Render products on index page
  if (document.getElementById("productsGrid")) {
    applySearchFilterSort();
  }

  // Render product page if on product page
  if (document.getElementById("productContainer")) {
    renderProductPage();
  }

  // Attach UI event listeners
  attachUI();

  // Initialize hero slider
  initHeroSlider();

  // ---------- UI Bindings ----------
function attachUI() {
  // Category filter buttons
  document.querySelectorAll(".category-btn, [data-filter]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".category-btn, [data-filter]")
        .forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      CURRENT_FILTER =
        e.currentTarget.dataset.category || e.currentTarget.dataset.filter;
      applySearchFilterSort();
    });
  });

  // Search inputs
  const searchInputs = [
    document.getElementById("searchInput"),
    document.getElementById("searchInputMobile"),
    document.getElementById("searchBar"),
  ];
  searchInputs.forEach((inp) => {
    if (inp) {
      inp.addEventListener("input", (e) => {
        CURRENT_QUERY = e.target.value;
        applySearchFilterSort();
      });
    }
  });

  // Sort select
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      CURRENT_SORT = e.target.value;
      applySearchFilterSort();
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const { qty, total } = computeCartSummary();
      if (qty === 0) {
        showNotification(
          "Your cart is empty. Please add products before checkout.",
          "warning"
        );
        return;
      }
      showNotification(
        `Checkout completed! Total: ₹${total.toLocaleString()}. This is a demo.`,
        "success"
      );

      // Clear cart after checkout
      CART = {};
      saveCart();
      renderCart();
      updateCartBadge();
    });
  }

  // Cart sidebar close button
  const closeCartBtn = document.getElementById("closeCartBtn");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      document.getElementById("cartSidebar").classList.remove("open");
      document.getElementById("cartOverlay").classList.remove("open");
    });
  }

  // Cart offcanvas
  const offcanvasEl = document.getElementById("cartOffcanvas");
  if (offcanvasEl) {
    offcanvasEl.addEventListener("show.bs.offcanvas", renderCart);
  }

  // Cart button for sidebar
  const cartButton = document.getElementById("cartButton");
  if (cartButton && document.getElementById("cartSidebar")) {
    cartButton.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("cartSidebar").classList.add("open");
      document.getElementById("cartOverlay").classList.add("open");
      renderCart();
    });
  }

  // Cart overlay
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => {
      document.getElementById("cartSidebar").classList.remove("open");
      document.getElementById("cartOverlay").classList.remove("open");
    });
  }

  // Remove the setupAuthModal() call since we're using a separate login page
}
});
