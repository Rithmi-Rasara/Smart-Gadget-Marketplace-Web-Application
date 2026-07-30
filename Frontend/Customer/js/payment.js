const order = JSON.parse(localStorage.getItem("lastOrder"));

document.getElementById("orderNo").innerHTML = "Order #" + order.order_id;

document.getElementById("amount").innerHTML = "Rs. " + order.total_amount;

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

        amount: order.total_amount,
      }),
    },
  );

  const result = await response.json();

  alert(result.message);

  window.location.href = "customer-orders.html";
}
