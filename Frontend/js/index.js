// LOGIN GUARD - blocks navigation to protected pages if not logged in

function requireLogin(event, destination) {
  if (event) {
    event.preventDefault();
  }

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please Login First");

    window.location.href = "login.html";

    return;
  }

  window.location.href = destination;
}

function handleSubscribe(event) {
  if (event) {
    event.preventDefault();
  }

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please Login First");

    window.location.href = "login.html";

    return;
  }

  const emailInput = document.getElementById("newsletterEmail");

  if (!emailInput || !emailInput.value.trim()) {
    alert("Enter Your Email");

    return;
  }

  alert("Subscribed Successfully");

  emailInput.value = "";
}

// FEATURED PRODUCTS - HOMEPAGE

const FEATURED_COUNT = 4;

function getProductIcon(category) {
  const c = (category || "").trim().toLowerCase();

  switch (c) {
    case "smart phone":
    case "smart phones":
    case "phone":
    case "phones":
      return "fas fa-mobile-alt";

    case "laptop":
    case "laptops":
      return "fas fa-laptop";

    case "tablet":
    case "tablets":
      return "fas fa-tablet-alt";

    case "smart watch":
    case "smart watches":
      return "fas fa-clock";

    case "headphone":
    case "headphones":
      return "fas fa-headphones";

    case "gaming console":
    case "gaming consoles":
      return "fas fa-gamepad";

    case "computer component":
    case "computer components":
      return "fas fa-memory";

    case "accessory":
    case "accessories":
      return "fas fa-keyboard";

    default:
      return "fas fa-microchip";
  }
}

async function loadFeaturedProducts() {
  const container = document.getElementById("featuredProducts");

  try {
    const response = await fetch("http://localhost:3000/api/products");

    const products = await response.json();

    const inStock = products.filter(
      (product) => Number(product.STOCK_QUANTITY) > 0,
    );

    const featured = inStock.slice(0, FEATURED_COUNT);

    if (featured.length === 0) {
      container.innerHTML = `
        <p class="featured-status">
          No Featured Products Available Right Now
        </p>
      `;

      return;
    }

    let html = "";

    featured.forEach((product) => {
      const icon = getProductIcon(product.CATEGORY_NAME);

      html += `
        <div class="product featured-product">
          <span class="featured-tag">
            <i class="fas fa-star"></i>
            Featured
          </span>

          <i class="${icon} product-icon"></i>

          <h3>${product.PRODUCT_NAME}</h3>

          <p>${product.CATEGORY_NAME || "Gadget"} &middot; ${product.SHOP_NAME || "Verified Seller"}</p>

          <h2>Rs. ${Number(product.PRICE).toLocaleString()}</h2>

          <button onclick="requireLogin(event, 'Customer/customer-shop.html')">
            <i class="fas fa-arrow-right"></i>
            View Details
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.log(error);

    container.innerHTML = `
      <p class="featured-status">
        Couldn't Load Featured Products. Please Try Again Later.
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadFeaturedProducts);
