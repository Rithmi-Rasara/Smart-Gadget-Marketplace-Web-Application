const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Please login first");

  window.location.href = "../login.html";
}

const CUSTOMER_ID = user.CUSTOMER_ID;

console.log("User Object:", user);
console.log("CUSTOMER_ID:", CUSTOMER_ID);

document.getElementById("welcomeUser").innerHTML = "Welcome, " + user.USERNAME;

async function loadDashboard() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/customer/dashboard/${CUSTOMER_ID}`,
    );

    const data = await response.json();

    console.log("Dashboard Data:", data);

    if (data.success === false) {
      console.log(data.message);

      return;
    }

    document.getElementById("cartCount").innerHTML = data.cart || 0;

    document.getElementById("orderCount").innerHTML = data.orders || 0;

    document.getElementById("spentAmount").innerHTML =
      "Rs. " + (data.spent || 0);
  } catch (error) {
    console.log("Dashboard Error :", error);
  }
}

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/customer/products");

    const products = await response.json();

    console.log("Products:", products);

    let html = "";

    if (products.length === 0) {
      html = `

            <tr>

                <td colspan="5">

                    No Products Available

                </td>

            </tr>

            `;
    } else {
      products.forEach((product) => {
        let date = "-";

        if (product.CREATED_DATE) {
          date = new Date(product.CREATED_DATE).toLocaleDateString("en-GB");
        }

        html += `


                <tr>


                    <td>

                        ${product.PRODUCT_NAME}

                    </td>



                    <td>

                        ${product.CATEGORY_NAME}

                    </td>



                    <td>

                        Rs. ${product.PRICE}

                    </td>



                    <td>

                        ${date}

                    </td>



                    <td>


                        <button onclick="addToCart(${product.PRODUCT_ID})">

                            <i class="fas fa-cart-plus"></i>

                            Add Cart

                        </button>


                    </td>


                </tr>


                `;
      });
    }

    document.getElementById("productTable").innerHTML = html;
  } catch (error) {
    console.log("Product Error :", error);
  }
}

async function addToCart(productId) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/customer/cart",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          customer_id: CUSTOMER_ID,

          product_id: productId,

          quantity: 1,
        }),
      },
    );

    const result = await response.json();

    alert(result.message);

    loadDashboard();
  } catch (error) {
    console.log("Cart Error :", error);
  }
}

function logout() {
  localStorage.removeItem("user");

  window.location.href = "../login.html";
}

loadDashboard();

loadProducts();
