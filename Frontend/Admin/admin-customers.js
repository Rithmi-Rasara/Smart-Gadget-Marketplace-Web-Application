console.log("admin customers loaded");


let customers=[];



document.addEventListener(
"DOMContentLoaded",
()=>{

loadCustomers();

});




async function loadCustomers(){


try{


const response = await fetch(

"http://localhost:3000/api/admin/customers"

);



customers = await response.json();



displayCustomers(customers);



}


catch(error){


console.log(error);


alert("Customer Load Failed");


}



}


function displayCustomers(data){


const table =
document.getElementById("customerList");



table.innerHTML="";





if(data.length===0){


table.innerHTML=`

<tr>

<td colspan="7" class="empty">

No Customers Found

</td>

</tr>

`;


return;


}






data.forEach(customer=>{



let statusClass="active";



if(customer.STATUS==="INACTIVE"){

statusClass="blocked";


}



table.innerHTML += `



<tr>


<td>

${customer.CUSTOMER_ID}

</td>



<td>

${customer.FULL_NAME}

</td>




<td>

${customer.EMAIL}

</td>




<td>

${customer.PHONE || "-"}

</td>




<td>

${customer.CITY || "-"}

</td>




<td>


<span class="status ${statusClass}">

${customer.STATUS}

</span>


</td>




<td>



<button class="delete"

onclick="deleteCustomer(${customer.CUSTOMER_ID})">


<i class="fas fa-trash"></i>

Delete


</button>



</td>



</tr>


`;



});



}


function searchCustomer(){



const value =

document.getElementById("search")
.value
.toLowerCase();





const filtered = customers.filter(customer=>


customer.FULL_NAME
.toLowerCase()
.includes(value)


||

customer.EMAIL
.toLowerCase()
.includes(value)


||

(customer.CITY || "")
.toLowerCase()
.includes(value)



);



displayCustomers(filtered);



}

async function deleteCustomer(id){



if(!confirm(
"Delete this customer?"
))

return;

try{


const response = await fetch(


"http://localhost:3000/api/admin/customers/"+id,


{


method:"DELETE"


}



);

const result =
await response.json();

if(result.success){


alert(
"Customer Deleted Successfully"
);


loadCustomers();

}

else{


alert(result.message);


}

}

catch(error){

console.log(error);

alert("Delete Failed");

}


}

function back(){


window.location.href="admin-dashboard.html";


}