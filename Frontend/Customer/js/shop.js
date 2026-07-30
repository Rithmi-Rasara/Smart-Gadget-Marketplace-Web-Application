document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/products");

    const products = await response.json();

    let html = "";

    products.forEach((product) => {
      html += `


<div class="product">


<i class="fas fa-mobile-alt"></i>


<h2>
${product.PRODUCT_NAME}
</h2>


<p>
Category : ${product.CATEGORY_NAME}
</p>


<p>
Seller : ${product.SHOP_NAME}
</p>



<div class="price">

Rs. ${product.PRICE}

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

    document.getElementById("productList").innerHTML = html;
  } catch (error) {
    console.log(error);
  }
}
async function addCart(product_id) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please Login");

    return;
  }

  const response = await fetch(
    "http://localhost:3000/api/customer/cart",

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        customer_id: user.CUSTOMER_ID,

        product_id: product_id,

        quantity: 1,
      }),
    },
  );

  const result = await response.json();

  alert(result.message);
}

function goBack() {
  window.location.href = "customer-dashboard.html";
}
