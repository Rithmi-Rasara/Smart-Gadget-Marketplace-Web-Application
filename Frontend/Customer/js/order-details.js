const params = new URLSearchParams(window.location.search);

const order_id = params.get("order_id");

loadDetails();

async function loadDetails() {
  const response = await fetch(
    `http://localhost:3000/api/customer/order-details/${order_id}`,
  );

  const data = await response.json();

  console.log(data);

  let html = "";

  let total = data[0].TOTAL_AMOUNT;

  html += `


<div class="order-box">


<h2>

Order #${order_id}

</h2>


<p>

Status :
${data[0].ORDER_STATUS}

</p>


<p>

Date :
${new Date(data[0].ORDER_DATE).toLocaleDateString()}

</p>



<h2>

Products

</h2>


`;

  data.forEach((item) => {
    html += `


<div class="product">


<h3>

${item.PRODUCT_NAME}

</h3>


<p>

Seller :
${item.SHOP_NAME}

</p>


<p>

Quantity :
${item.QUANTITY}

</p>



<div class="price">

Rs. ${item.LINE_TOTAL}

</div>



</div>


`;
  });

  html += `


<h2>

Total Amount :

<span class="price">

Rs. ${total}

</span>


</h2>


</div>


`;

  document.getElementById("details").innerHTML = html;
}

function back() {
  history.back();
}
