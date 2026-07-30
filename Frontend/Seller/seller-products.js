let seller_id;

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "../login.html";

    return;
  }

  seller_id = user.SELLER_ID;

  loadProducts();
});

async function loadProducts() {
  try {
    const res = await fetch(
      "http://localhost:3000/api/seller/products/" + seller_id,
    );

    const products = await res.json();

    let html = "";

    products.forEach((p) => {
      html += `


<tr>


<td>
${p.PRODUCT_ID}
</td>



<td>
${p.PRODUCT_NAME}
</td>



<td>
Rs.${p.PRICE}
</td>



<td>
${p.STOCK_QUANTITY}
</td>



<td>
${p.STATUS}
</td>



<td class="action">


<button class="edit"

onclick="editProduct(${p.PRODUCT_ID})">


<i class="fas fa-edit"></i>

Edit


</button>





<button class="delete"

onclick="deleteProduct(${p.PRODUCT_ID})">


<i class="fas fa-trash"></i>

Delete


</button>



</td>


</tr>


`;
    });

    document.getElementById("productTable").innerHTML = html;
  } catch (error) {
    console.log(error);

    alert("Products loading failed");
  }
}

function editProduct(id) {
  window.location.href = "seller-edit-product.html?id=" + id;
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(
      "http://localhost:3000/api/seller/products/" + id,

      {
        method: "DELETE",
      },
    );

    const data = await res.json();

    alert(data.message);

    loadProducts();
  } catch (error) {
    console.log(error);

    alert("Delete Failed");
  }
}

function addProduct() {
  window.location.href = "seller-add-product.html";
}
