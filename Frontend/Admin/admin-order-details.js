console.log("admin order details loaded");



document.addEventListener(
"DOMContentLoaded",
()=>{

loadOrderDetails();

});


const params = new URLSearchParams(
window.location.search
);


const orderId = params.get("id");



async function loadOrderDetails(){


try{


const response = await fetch(

"http://localhost:3000/api/admin/orders/"+orderId

);



const data = await response.json();




displayOrderInfo(data.order);



displayItems(data.items);



displayDelivery(data.delivery);



}



catch(error){


console.log(error);


alert("Order Details Load Failed");


}



}


function displayOrderInfo(order){



document.getElementById("orderInfo").innerHTML = `


<p>
<b>Order ID :</b>
#${order.ORDER_ID}
</p>


<p>
<b>Customer :</b>
${order.CUSTOMER_NAME}
</p>


<p>
<b>Email :</b>
${order.EMAIL}
</p>



<p>
<b>Phone :</b>
${order.PHONE || "-"}
</p>



<p>
<b>Total Amount :</b>
Rs. ${order.TOTAL_AMOUNT}
</p>



<p>
<b>Status :</b>

<span class="status">

${order.ORDER_STATUS}

</span>

</p>



`;



}


function displayItems(items){



const table =
document.getElementById("itemList");



table.innerHTML="";




items.forEach(item=>{



table.innerHTML += `


<tr>


<td>

${item.PRODUCT_NAME}

</td>



<td>

${item.QUANTITY}

</td>



<td>

Rs. ${item.UNIT_PRICE}

</td>



<td>

Rs. ${item.LINE_TOTAL}

</td>



</tr>


`;



});



}


function displayDelivery(delivery){



document.getElementById("deliveryInfo").innerHTML = `



<p>

<b>Address :</b>

${delivery.DELIVERY_ADDRESS || "-"}

</p>



<p>

<b>City :</b>

${delivery.DELIVERY_CITY || "-"}

</p>




<p>

<b>Status :</b>

${delivery.DELIVERY_STATUS || "PENDING"}

</p>



<p>

<b>Estimated Date :</b>

${delivery.ESTIMATED_DATE || "-"}

</p>



`;



}







function back(){


window.location.href="admin-orders.html";


}