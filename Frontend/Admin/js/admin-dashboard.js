document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadRecentOrders();
});

async function loadDashboard() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/dashboard");

    const data = await response.json();

    document.getElementById("products").innerHTML = data.TOTAL_PRODUCTS;

    document.getElementById("customers").innerHTML = data.TOTAL_CUSTOMERS;

    document.getElementById("orders").innerHTML = data.TOTAL_ORDERS;

    document.getElementById("revenue").innerHTML = "Rs. " + data.TOTAL_REVENUE;
  } catch (error) {
    console.log(error);
  }
}

async function loadRecentOrders() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/orders");

    const orders = await response.json();

    let html = "";

    if (orders.length === 0) {
      html = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    No Orders Found
                </td>
            </tr>
            `;
    } else {
      orders.slice(0, 5).forEach((order) => {
        html += `
                <tr>

                    <td>#${order.ORDER_ID}</td>

                    <td>${order.CUSTOMER_NAME}</td>

                    <td>Rs. ${order.TOTAL_AMOUNT}</td>

                    <td>${order.ORDER_STATUS}</td>

                </tr>
                `;
      });
    }

    document.getElementById("orderTable").innerHTML = html;
  } catch (error) {
    console.log(error);
  }
}

function logout() {
  localStorage.removeItem("user");

  window.location.href = "../login.html";
}
