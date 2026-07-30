console.log("admin sellers loaded");

let sellers = [];

document.addEventListener("DOMContentLoaded", () => {
  loadSellers();
});

async function loadSellers() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/sellers");

    sellers = await response.json();

    displaySellers(sellers);
  } catch (error) {
    console.log(error);

    alert("Seller Load Failed");
  }
}

function displaySellers(data) {
  const table = document.getElementById("sellerList");

  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `

<tr>

<td colspan="8" class="empty">

No Sellers Found

</td>

</tr>

`;

    return;
  }

  data.forEach((seller) => {
    let statusClass = "pending";

    if (seller.STATUS === "APPROVED") {
      statusClass = "active";
    }

    if (seller.STATUS === "REJECTED") {
      statusClass = "rejected";
    }

    table.innerHTML += `


<tr>


<td>
${seller.SELLER_ID}
</td>


<td>
${seller.SHOP_NAME}
</td>


<td>
${seller.OWNER_NAME}
</td>



<td>
${seller.EMAIL}
</td>



<td>
${seller.PHONE || "-"}
</td>




<td>
${seller.CITY || "-"}
</td>





<td>

<span class="status ${statusClass}">

${seller.STATUS}

</span>


</td>






<td>


<button class="approve"

onclick="updateSellerStatus(${seller.SELLER_ID},'APPROVED')">


<i class="fas fa-check"></i>

Approve


</button>



<button class="reject"

onclick="updateSellerStatus(${seller.SELLER_ID},'REJECTED')">


<i class="fas fa-times"></i>

Reject


</button>


</td>



</tr>


`;
  });
}

function searchSeller() {
  const value = document.getElementById("search").value.toLowerCase();

  const filtered = sellers.filter(
    (seller) =>
      seller.SHOP_NAME.toLowerCase().includes(value) ||
      seller.OWNER_NAME.toLowerCase().includes(value) ||
      seller.EMAIL.toLowerCase().includes(value),
  );

  displaySellers(filtered);
}

async function updateSellerStatus(id, status) {
  if (!confirm("Change seller status to " + status + "?")) return;

  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/sellers/" + id,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: status,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      alert("Seller Status Updated");

      loadSellers();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.log(error);

    alert("Update Failed");
  }
}

function back() {
  window.location.href = "admin-dashboard.html";
}
