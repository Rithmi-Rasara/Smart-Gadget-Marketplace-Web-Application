const CUSTOMER_ID = localStorage.getItem("customer_id");

if (!CUSTOMER_ID) {
  alert("Please login first");

  window.location.href = "../login.html";
}

// API
const API = "http://localhost:3000/api/customer/profile/";

async function loadProfile() {
  try {
    const response = await fetch(API + CUSTOMER_ID);

    if (!response.ok) {
      throw new Error("Cannot load profile");
    }

    const data = await response.json();

    document.getElementById("customer_id").value = data.CUSTOMER_ID;
    document.getElementById("full_name").value = data.FULL_NAME || "";
    document.getElementById("email").value = data.EMAIL || "";
    document.getElementById("phone").value = data.PHONE || "";
    document.getElementById("city").value = data.CITY || "";
    document.getElementById("address").value = data.ADDRESS || "";

    document.getElementById("status").innerHTML = data.STATUS || "ACTIVE";

    if (data.CREATED_DATE) {
      const date = new Date(data.CREATED_DATE);

      document.getElementById("created_date").value = date.toLocaleDateString();
    }
  } catch (error) {
    console.log(error);

    alert(error.message);
  }
}

async function updateProfile() {
  const customer = {
    FULL_NAME: document.getElementById("full_name").value,

    EMAIL: document.getElementById("email").value,

    PHONE: document.getElementById("phone").value,

    CITY: document.getElementById("city").value,

    ADDRESS: document.getElementById("address").value,
  };

  try {
    const response = await fetch(API + CUSTOMER_ID, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(customer),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Update Failed");
    }

    alert("Profile Updated Successfully");

    loadProfile();
  } catch (error) {
    console.log(error);

    alert(error.message);
  }
}

function back() {
  window.location.href = "customer-dashboard.html";
}

loadProfile();
