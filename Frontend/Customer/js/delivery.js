document.addEventListener("DOMContentLoaded", () => {
  loadDeliveries();
});

async function loadDeliveries() {
  const user = JSON.parse(localStorage.getItem("user"));

  console.log(user);

  const response = await fetch(
    "http://localhost:3000/api/customer/delivery/" + user.CUSTOMER_ID,
  );

  const deliveries = await response.json();

  console.log(deliveries);

  let html = "";

  deliveries.forEach((item) => {
    html += `

<div class="delivery-box">

<h2>
Order #${item.ORDER_ID}
</h2>


<p>
Address :
${item.DELIVERY_ADDRESS}
</p>


<p>
City :
${item.DELIVERY_CITY}
</p>


<h3>
Status :
${item.DELIVERY_STATUS}
</h3>


</div>

`;
  });

  document.getElementById("deliveryList").innerHTML = html;
}
