window.onload = function () {
  console.log("WINDOW LOADED");

  console.log(typeof loadReports);

  loadReports();
};

async function loadReports() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/reports");

    const data = await response.json();
    console.log("REPORT DATA:", data);

    document.getElementById("customers").innerHTML =
      data.CUSTOMERS || data.customers;

    document.getElementById("sellers").innerHTML = data.SELLERS || data.sellers;

    document.getElementById("products").innerHTML =
      data.PRODUCTS || data.products;

    document.getElementById("orders").innerHTML = data.ORDERS || data.orders;

    document.getElementById("revenue").innerHTML =
      "Rs. " + (data.REVENUE || data.revenue);

    let table = document.getElementById("salesTable");

    table.innerHTML = "";

    data.topProducts.forEach((product) => {
      table.innerHTML += `


<tr>


<td>

${product.PRODUCT_NAME}

</td>


<td>

${product.QUANTITY_SOLD}

</td>


<td>

Rs. ${product.REVENUE}

</td>


</tr>


`;
    });
  } catch (error) {
    console.log(error);

    alert("Reports Load Failed");
  }
}

function back() {
  window.location.href = "admin-dashboard.html";
}
