console.log("admin categories loaded");


let categories=[];



document.addEventListener(
"DOMContentLoaded",
()=>{

loadCategories();

});



async function loadCategories(){


try{


const response =
await fetch(
"http://localhost:3000/api/admin/categories"
);



categories =
await response.json();



displayCategories();



}

catch(error){

console.log(error);

alert("Category Load Failed");

}


}





function displayCategories(){


const table =
document.getElementById("categoryList");


table.innerHTML="";



categories.forEach(cat=>{


table.innerHTML +=`


<tr>


<td>
${cat.CATEGORY_ID}
</td>


<td>
${cat.CATEGORY_NAME}
</td>



<td>
${cat.DESCRIPTION || ""}
</td>



<td>


<button class="delete"
onclick="deleteCategory(${cat.CATEGORY_ID})">


<i class="fas fa-trash"></i>

Delete


</button>


</td>



</tr>


`;



});


}

async function addCategory(){



const data={


category_name:
document.getElementById("category_name").value,


description:
document.getElementById("description").value


};



const response =
await fetch(

"http://localhost:3000/api/admin/categories",

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify(data)


}

);



const result =
await response.json();



if(result.success){


alert("Category Added");


loadCategories();


}



else{


alert(result.message);


}



}


async function deleteCategory(id){


if(!confirm("Delete this category?"))
return;



const response =
await fetch(

"http://localhost:3000/api/admin/categories/"+id,

{

method:"DELETE"

}

);



const result =
await response.json();



if(result.success){


alert("Deleted");


loadCategories();


}


}





function back(){

window.location.href="admin-dashboard.html";

}