const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Please login first");
  window.location.href = "../login.html";
}

const customer_id = user.CUSTOMER_ID;

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

// LOAD PRODUCTS

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    const products = await response.json();

    let html = "";

    products.forEach((product) => {
      if (Number(product.STOCK_QUANTITY) <= 0) {
        return;
      }

      const icon = getProductIcon(product.CATEGORY_NAME);

      html += `
                <div class="product">

                    <i class="${icon}"></i>

                    <h2>${product.PRODUCT_NAME}</h2>

                    <p><b>Category :</b> ${product.CATEGORY_NAME}</p>

                    <p><b>Seller :</b> ${product.SHOP_NAME}</p>

                    <div class="price">
                        Rs. ${Number(product.PRICE).toLocaleString()}
                    </div>

                    <div class="stock">
                        Stock : ${product.STOCK_QUANTITY}
                    </div>

                    <button onclick="addCart(${product.PRODUCT_ID})">
                        <i class="fas fa-cart-plus"></i>
                        Add Cart
                    </button>

                </div>
            `;
    });

    if (html === "") {
      html = `
                <h2 style="grid-column:1/-1;text-align:center;color:#aaa;">
                    No Products Available
                </h2>
            `;
    }

    document.getElementById("productList").innerHTML = html;
  } catch (error) {
    console.log(error);
    alert("Failed to load products.");
  }
}

async function addCart(product_id) {
  try {
    const response = await fetch("http://localhost:3000/api/customer/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customer_id,
        product_id: product_id,
        quantity: 1,
      }),
    });

    const result = await response.json();

    alert(result.message);

    loadProducts();
  } catch (error) {
    console.log(error);
    alert("Failed to add product to cart.");
  }
}

function goBack() {
  window.location.href = "customer-dashboard.html";
}

loadProducts();
