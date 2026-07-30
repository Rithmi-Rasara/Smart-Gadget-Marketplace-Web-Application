document.addEventListener("DOMContentLoaded", () => {
  loadSellerOrders();
});

async function loadSellerOrders() {
  const seller = JSON.parse(localStorage.getItem("user"));

  if (!seller) {
    alert("Please Login");

    window.location.href = "../login.html";

    return;
  }

  const seller_id = seller.SELLER_ID;
  console.log("SELLER ID:", seller_id);

  try {
    const response = await fetch(
      "http://localhost:3000/api/seller/orders/" + seller_id,
    );

    const orders = await response.json();

    let html = "";

    if (orders.length === 0) {
      html = `

<div class="empty">

<i class="fas fa-box-open"></i>

<br>

No Orders Found

</div>

`;
    } else {
      orders.forEach((order) => {
        html += `


<div class="order-card">


<h2>

<i class="fas fa-shopping-cart"></i>

Order #${order.ORDER_ID}

</h2>



<div class="info">


<p>

<i class="fas fa-user"></i>

Customer :

${order.CUSTOMER_NAME}

</p>



<p>

<i class="fas fa-mobile"></i>

Product :

${order.PRODUCT_NAME}

</p>



<p>

<i class="fas fa-layer-group"></i>

Quantity :

${order.QUANTITY}

</p>



<p>

<i class="fas fa-money-bill"></i>

Amount :

Rs.${order.LINE_TOTAL}

</p>



<p>

<i class="fas fa-truck"></i>

Delivery Status :

<span class="status">

${order.DELIVERY_STATUS || "PROCESSING"}

</span>

</p>



</div>




<div class="actions">



<button 

class="ship-btn"

onclick="updateDelivery(${order.DELIVERY_ID},'SHIPPED')">

<i class="fas fa-truck"></i>

SHIPPED

</button>





<button

class="deliver-btn"

onclick="updateDelivery(${order.DELIVERY_ID},'DELIVERED')">

<i class="fas fa-check"></i>

DELIVERED

</button>



</div>



</div>


`;
      });
    }

    document.getElementById("orderList").innerHTML = html;
  } catch (error) {
    console.log(error);

    alert("Unable to load orders");
  }
}

async function updateDelivery(id, status) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/seller/delivery/update/" + id,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: status,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      alert("Delivery Updated Successfully");

      loadSellerOrders();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.log("ORDER ERROR:", error);

    alert(error.message);
  }
}
