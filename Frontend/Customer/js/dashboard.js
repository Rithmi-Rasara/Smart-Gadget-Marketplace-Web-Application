document.addEventListener(
"DOMContentLoaded",
()=>{


    loadCustomer();

    loadDashboard();

    loadProducts();


});

function getUser(){


    const user =
    JSON.parse(
        localStorage.getItem("user")
    );


    return user;


}

function loadCustomer(){


    const user = getUser();



    if(!user){

        window.location.href="../login.html";

        return;

    }



    document.getElementById(
        "welcomeUser"
    ).innerHTML =

    "Welcome, "+user.USERNAME;



}

async function loadDashboard(){


try{


const user=getUser();



const response = await fetch(

`http://localhost:3000/api/customer/dashboard/${user.CUSTOMER_ID}`

);



const data = await response.json();




document.getElementById(
"cartCount"
)
.innerHTML=data.cart;



document.getElementById(
"orderCount"
)
.innerHTML=data.orders;



document.getElementById(
"deliveryCount"
)
.innerHTML=data.deliveries;



document.getElementById(
"spentAmount"
)
.innerHTML=

"Rs. "+data.spent;



}

catch(error){


console.log(error);


}


}

async function loadProducts(){


try{


const response = await fetch(

"http://localhost:3000/api/customer/products"

);



const products =
await response.json();




let html="";



products.forEach(product=>{


html +=

`

<tr>


<td>
${product.PRODUCT_NAME}
</td>



<td>
${product.CATEGORY_ID}
</td>



<td>
Rs.${product.PRICE}
</td>



<td>
${product.STOCK_QUANTITY}
</td>



<td>

<button

onclick="addCart(${product.PRODUCT_ID})"

>

Add Cart

</button>

</td>


</tr>

`;



});



document.getElementById(
"productTable"
)
.innerHTML=html;



}


catch(error){


console.log(error);


}


}

async function addCart(productId){



const user=getUser();



const response =
await fetch(

"http://localhost:3000/api/customer/cart",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

customer_id:user.CUSTOMER_ID,

product_id:productId,

quantity:1

})


}

);



const result =
await response.json();



alert(result.message);



loadDashboard();



}

function logout(){



localStorage.removeItem("user");


window.location.href="../login.html";


}