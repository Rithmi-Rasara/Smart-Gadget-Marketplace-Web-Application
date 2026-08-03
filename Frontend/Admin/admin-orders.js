console.log("admin orders loaded");

let orders = [];

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

async function loadOrders() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/orders");

    orders = await response.json();

    displayOrders(orders);
  } catch (error) {
    console.log(error);

    alert("Orders Load Failed");
  }
}

function displayOrders(data) {
  const table = document.getElementById("orderList");

  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `

<tr>

<td colspan="7" class="empty">

No Orders Found

</td>

</tr>

`;

    return;
  }

  data.forEach((order) => {
    let orderClass = "pending";

    if (order.ORDER_STATUS === "COMPLETED") {
      orderClass = "completed";
    }

    if (order.ORDER_STATUS === "CANCELLED") {
      orderClass = "cancelled";
    }

    let delivery = order.DELIVERY_STATUS || "PENDING";

    table.innerHTML += `

<tr>

<td>

#${order.ORDER_ID}

</td>

<td>

${order.CUSTOMER_NAME}

</td>

<td>

${new Date(order.ORDER_DATE).toLocaleDateString()}

</td>

<td>

Rs. ${order.TOTAL_AMOUNT}

</td>


<td>

<span class="status ${orderClass}">

${order.ORDER_STATUS}

</span>


</td>

<td>

${delivery}

</td>



</tr>


`;
  });
}

function searchOrder() {
  const value = document.getElementById("search").value.toLowerCase();

  const filtered = orders.filter(
    (order) =>
      String(order.ORDER_ID).includes(value) ||
      order.CUSTOMER_NAME.toLowerCase().includes(value),
  );

  displayOrders(filtered);
}

function viewOrder(id) {
  window.location.href = "admin-order-details.html?id=" + id;
}

function back() {
  window.location.href = "admin-dashboard.html";
}
