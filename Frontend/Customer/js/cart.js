console.log("CART JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});

async function loadCart() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("USER :", user);

    if (!user) {
      alert("Please Login");

      return;
    }

    const customer_id = user.CUSTOMER_ID;

    console.log("CUSTOMER ID :", customer_id);

    const response = await fetch(
      `http://localhost:3000/api/customer/cart/${customer_id}`,
    );

    const cart = await response.json();

    console.log("CART DATA :", cart);

    let html = "";

    let total = 0;

    if (cart.length === 0) {
      html = `

<div class="empty">

Cart is Empty

</div>

`;
    } else {
      cart.forEach((item) => {
        total += item.TOTAL_PRICE;

        html += `


<div class="cart-item">


<div>


<div class="product-name">

${item.PRODUCT_NAME}

</div>


<p>

Seller :
${item.SHOP_NAME}

</p>


<p class="qty">

Quantity :
${item.QUANTITY}

</p>


</div>



<div class="price">

Rs. ${item.TOTAL_PRICE}

</div>



</div>


`;
      });
    }

    document.getElementById("cartList").innerHTML = html;

    document.getElementById("total").innerHTML = total;
  } catch (error) {
    console.log("CART ERROR :", error);
  }
}

function goShop() {
  window.location.href = "customer-shop.html";
}

function checkout() {
  window.location.href = "checkout.html";
}
