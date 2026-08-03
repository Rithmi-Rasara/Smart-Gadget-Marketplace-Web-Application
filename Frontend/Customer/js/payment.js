const order = JSON.parse(localStorage.getItem("lastOrder"));

if (!order) {
  alert("Order not found");

  window.location.href = "cart.html";
}

document.getElementById("orderNo").innerHTML = "Order #" + order.order_id;

document.getElementById("amount").innerHTML =
  "Rs. " + Number(order.total_amount).toFixed(2);

async function payNow() {
  const response = await fetch(
    "http://localhost:3000/api/customer/payment",

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        order_id: order.order_id,

        payment_method: document.getElementById("method").value,

        amount: Number(order.total_amount),
      }),
    },
  );

  const result = await response.json();

  console.log(result);

  alert(result.message);

  if (result.success) {
    localStorage.removeItem("lastOrder");

    window.location.href = "customer-orders.html";
  }
}
