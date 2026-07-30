console.log("customer-orders.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

async function loadOrders() {
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("Logged User:", user);

  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  try {
    const customerId = user.CUSTOMER_ID || user.customer_id;

    console.log("Customer ID:", customerId);

    const url = "http://localhost:3000/api/customer/orders/" + customerId;

    console.log("API URL:", url);

    const response = await fetch(url);

    console.log("Response Status:", response.status);

    const orders = await response.json();

    console.log("Orders:", orders);

    let html = "";

    if (!Array.isArray(orders) || orders.length === 0) {
      html = `
                <div class="order-card">
                    <h2>No Orders Found</h2>
                </div>
            `;
    } else {
      orders.forEach((order) => {
        html += `
                <div class="order-card">

                    <h2>
                        <i class="fas fa-box"></i>
                        Order #${order.ORDER_ID}
                    </h2>

                    <p><i class="fas fa-store"></i> Shop : ${order.SHOP_NAME || "-"}</p>

                    <p>📱 Product : ${order.PRODUCT_NAME || "-"}</p>

                    <p>Quantity : ${order.QUANTITY || 0}</p>

                    <p>Price : Rs.${order.UNIT_PRICE || 0}</p>

                    <p>Total : Rs.${order.LINE_TOTAL || order.TOTAL_AMOUNT || 0}</p>

                    <hr>

                    <h3><i class="fas fa-truck"></i> Delivery Details</h3>

                    <p>Delivery Status : ${order.DELIVERY_STATUS || "PROCESSING"}</p>

                    <p>Address : ${order.DELIVERY_ADDRESS || "-"}</p>

                    <p>City : ${order.DELIVERY_CITY || "-"}</p>

                    <p>Estimated Date : ${formatDate(order.ESTIMATED_DATE)}</p>

                    <p>Delivered Date : ${formatDate(order.DELIVERED_DATE)}</p>

                    <p>Order Date : ${formatDate(order.ORDER_DATE)}</p>

                    <p>Order Status : ${order.ORDER_STATUS || "-"}</p>

                </div>
                `;
      });
    }

    document.getElementById("orderList").innerHTML = html;
  } catch (error) {
    console.error("Load Orders Error:", error);

    document.getElementById("orderList").innerHTML = `
            <div class="order-card">
                <h2>Error Loading Orders</h2>
            </div>
        `;
  }
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
}

function back() {
  window.location.href = "customer-dashboard.html";
}
