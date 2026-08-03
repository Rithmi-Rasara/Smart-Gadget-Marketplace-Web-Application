console.log("admin products loaded");

let products = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/products");

    const data = await response.json();

    console.log(data);

    products = data;

    displayProducts(products);
  } catch (error) {
    console.log(error);

    alert("Products Load Failed");
  }
}

function displayProducts(list) {
  const table = document.getElementById("productList");

  table.innerHTML = "";

  if (list.length === 0) {
    table.innerHTML = `

<tr>

<td colspan="8" style="text-align:center">

No Products Found

</td>

</tr>

`;

    return;
  }

  list.forEach((product) => {
    table.innerHTML += `



<tr>


<td>

${product.PRODUCT_ID}

</td>



<td>

${product.PRODUCT_NAME}

</td>




<td>

${product.SHOP_NAME || "N/A"}

</td>




<td>

${product.CATEGORY_NAME || "N/A"}

</td>





<td>

Rs.${product.PRICE}

</td>





<td>

${product.STOCK_QUANTITY}

</td>





<td>


<span class="status">

${product.STATUS}

</span>


</td>





<td>


<button 

class="delete"

onclick="deleteProduct(${product.PRODUCT_ID})">


<i class="fas fa-trash"></i>

Delete


</button>


</td>



</tr>



`;
  });
}

function searchProduct() {
  const value = document.getElementById("search").value.toLowerCase();

  const filtered = products.filter((product) =>
    product.PRODUCT_NAME.toLowerCase().includes(value),
  );

  displayProducts(filtered);
}

async function deleteProduct(id) {
  const confirmDelete = confirm("Are you sure delete this product?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/products/" + id,

      {
        method: "DELETE",
      },
    );

    const result = await response.json();

    if (result.success) {
      alert("Product Deleted Successfully");

      loadProducts();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.log(error);

    alert("Delete Failed");
  }
}

function back() {
  window.location.href = "admin-dashboard.html";
}
