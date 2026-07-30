console.log("edit-product.js loaded");

const id = new URLSearchParams(window.location.search).get("id");

console.log("PRODUCT ID =", id);

async function loadProduct() {
  console.log("LOAD PRODUCT START");

  try {
    const response = await fetch(
      "http://localhost:3000/api/seller/product/" + id,
    );

    console.log("SERVER STATUS =", response.status);

    const product = await response.json();

    console.log("PRODUCT DATA =", product);

    if (!response.ok) {
      alert(product.message);

      return;
    }

    document.getElementById("name").value = product.PRODUCT_NAME || "";

    document.getElementById("description").value = product.DESCRIPTION || "";

    document.getElementById("price").value = product.PRICE || "";

    document.getElementById("stock").value = product.STOCK_QUANTITY || "";
  } catch (error) {
    console.log("LOAD ERROR =", error);

    alert("Cannot load product");
  }
}

loadProduct();

async function updateProduct() {
  console.log("UPDATE CLICKED");

  const data = {
    product_name: document.getElementById("name").value,

    description: document.getElementById("description").value,

    price: document.getElementById("price").value,

    stock_quantity: document.getElementById("stock").value,
  };

  console.log(data);

  const response = await fetch(
    "http://localhost:3000/api/seller/products/" + id,

    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  console.log(result);

  if (result.success) {
    alert("Product Updated Successfully");

    window.location.href = "seller-products.html";
  } else {
    alert(result.message);
  }
}
