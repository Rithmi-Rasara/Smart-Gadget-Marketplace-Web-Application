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

    const data = await res.json();

    console.log("API Response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Server Error");
    }

    const products = data;

    let html = "";

    if (!Array.isArray(products)) {
      document.getElementById("productTable").innerHTML = `

            <tr>
                <td colspan="6" class="empty">

                    Invalid product data

                </td>
            </tr>

            `;

      return;
    }

    if (products.length === 0) {
      document.getElementById("productTable").innerHTML = `

            <tr>
                <td colspan="6" class="empty">

                    No Products Found

                </td>
            </tr>

            `;

      return;
    }

    products.forEach((p) => {
      html += `

            <tr>

                <td>${p.PRODUCT_ID}</td>

                <td>${p.PRODUCT_NAME}</td>

                <td>Rs.${p.PRICE}</td>

                <td>${p.STOCK_QUANTITY}</td>

                <td class="status">
                    ${p.STATUS}
                </td>


                <td class="action">

                    <button class="edit"
                    onclick="editProduct(${p.PRODUCT_ID})">

                    Edit

                    </button>


                    <button class="delete"
                    onclick="deleteProduct(${p.PRODUCT_ID})">

                    Delete

                    </button>


                </td>


            </tr>

            `;
    });

    document.getElementById("productTable").innerHTML = html;
  } catch (error) {
    console.log(error);

    document.getElementById("productTable").innerHTML = `

        <tr>
            <td colspan="6" class="empty">

            ${error.message}

            </td>
        </tr>

        `;
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
