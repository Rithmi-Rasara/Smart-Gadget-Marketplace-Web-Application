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

  try {
    const response = await fetch(
      "http://localhost:3000/api/customer/cart/" + user.CUSTOMER_ID,
    );

    const cart = await response.json();

    let total = 0;

    cart.forEach((item) => {
      total += item.TOTAL_PRICE;
    });

    document.getElementById("itemCount").innerHTML = cart.length;

    document.getElementById("totalAmount").innerHTML = total;
  } catch (error) {
    console.log(error);
  }
}

async function createOrder() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please Login");

    return;
  }

  const address = document.getElementById("address").value;

  const payment = document.getElementById("payment").value;

  if (address === "") {
    alert("Enter Delivery Address");

    return;
  }

  try {
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
        }),
      },
    );

    const result = await response.json();
    if (result.success) {
      localStorage.setItem(
        "lastOrder",

        JSON.stringify({
          order_id: result.order_id,

          total_amount: result.total,
        }),
      );

      alert("Order Created Successfully\nOrder ID : " + result.order_id);

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
