console.log("seller-add-product.js loaded");

document.addEventListener("DOMContentLoaded", () => {});

async function saveProduct() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please Login");

    window.location.href = "../login.html";

    return;
  }

  const seller_id = user.SELLER_ID;

  const productData = {
    product_name: document.getElementById("product_name").value.trim(),

    category_id: document.getElementById("category_id").value,

    description: document.getElementById("description").value.trim(),

    price: document.getElementById("price").value,

    stock_quantity: document.getElementById("stock_quantity").value,

    seller_id: seller_id,
  };

  console.log("Sending Product Data:");

  console.log(productData);

  if (!productData.product_name) {
    alert("Enter Product Name");

    return;
  }

  if (!productData.price) {
    alert("Enter Price");

    return;
  }

  if (!productData.stock_quantity) {
    alert("Enter Stock Quantity");

    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/seller/products",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(productData),
      },
    );

    const result = await response.json();

    console.log("Server Response:");

    console.log(result);

    if (result.success) {
      alert("Product Added Successfully");

      window.location.href = "seller-products.html";
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.log(error);

    alert("Product Add Failed");
  }
}
