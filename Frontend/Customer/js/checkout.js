document.addEventListener("DOMContentLoaded", () => {
  loadCheckout();
});

async function loadCheckout() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please Login");
    window.location.href = "../login.html";
    return;
  }

  document.getElementById("customerName").innerHTML = user.USERNAME;

  const selected = JSON.parse(localStorage.getItem("selectedCart")) || [];

  if (selected.length === 0) {
    document.getElementById("itemCount").innerHTML = 0;
    document.getElementById("totalAmount").innerHTML = 0;

    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/customer/cart/" + user.CUSTOMER_ID,
    );

    const cart = await response.json();

    const selectedItems = cart.filter((item) =>
      selected.includes(Number(item.CART_ID)),
    );

    let total = 0;

    selectedItems.forEach((item) => {
      total += Number(item.TOTAL_PRICE);
    });

    document.getElementById("itemCount").innerHTML = selectedItems.length;

    document.getElementById("totalAmount").innerHTML = total.toFixed(2);

    console.log("Selected Items:", selectedItems);

    console.log("Checkout Total:", total);
  } catch (error) {
    console.log(error);
  }
}

async function createOrder() {
  const user = JSON.parse(localStorage.getItem("user"));

  const address = document.getElementById("address").value;

  const selected = JSON.parse(localStorage.getItem("selectedCart")) || [];

  if (selected.length === 0) {
    alert("Please select products");

    return;
  }

  if (address.trim() === "") {
    alert("Enter Address");

    return;
  }

  try {
    console.log("Sending cart ids:", selected);

    const response = await fetch(
      "http://localhost:3000/api/orders/create",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          customer_id: user.CUSTOMER_ID,

          address: address,

          cart_ids: selected,
        }),
      },
    );

    const result = await response.json();

    console.log("Order Response:", result);

    if (result.success) {
      // Save ONLY created order details

      localStorage.setItem(
        "lastOrder",

        JSON.stringify({
          order_id: result.order_id,

          total_amount: Number(result.total),
        }),
      );

      // Remove selected products only

      localStorage.removeItem("selectedCart");

      window.location.href = "payment.html";
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.log(error);

    alert("Order Failed");
  }
}

function backCart() {
  window.location.href = "cart.html";
}
