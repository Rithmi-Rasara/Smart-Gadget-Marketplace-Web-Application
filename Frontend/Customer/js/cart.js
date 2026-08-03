console.log("CART JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});

async function loadCart() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please Login");
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/customer/cart/" + user.CUSTOMER_ID,
    );

    const cart = await response.json();

    let html = "";
    let total = 0;

    cart.forEach((item) => {
      html += `

<div class="cart-item">


<div style="display:flex;align-items:center;gap:15px;">


<input
type="checkbox"
class="cartCheck"
value="${item.CART_ID}"
data-total="${item.TOTAL_PRICE}"
onchange="updateTotal()"
style="width:22px;height:22px;"
>



<div>


<div class="product-name">

${item.PRODUCT_NAME}

</div>


<p>
Seller : ${item.SHOP_NAME}
</p>


<p class="qty">

Quantity : ${item.QUANTITY}

</p>


</div>


</div>



<div class="price">

Rs. ${item.TOTAL_PRICE}

</div>


</div>


`;
    });

    document.getElementById("cartList").innerHTML = html;

    document.getElementById("total").innerHTML = 0;
  } catch (error) {
    console.log(error);
  }
}

function updateTotal() {
  let total = 0;

  document.querySelectorAll(".cartCheck:checked").forEach((item) => {
    total += Number(item.dataset.total);
  });

  document.getElementById("total").innerHTML = total;
}

function checkout() {
  const selected = [];

  document.querySelectorAll(".cartCheck:checked").forEach((item) => {
    selected.push(Number(item.value));
  });

  if (selected.length === 0) {
    alert("Please select products");

    return;
  }

  console.log("Selected Cart IDs :", selected);

  localStorage.setItem("selectedCart", JSON.stringify(selected));

  window.location.href = "checkout.html";
}

function goShop() {
  window.location.href = "customer-shop.html";
}
