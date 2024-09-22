//restaurant.js

const orders = {
  1: [],
  2: [],
  3: [],
};

document.addEventListener("DOMContentLoaded", function () {
  const resizer = document.querySelector(".resizer");
  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".content");

  let isResizing = false;

  resizer.addEventListener("mousedown", function (e) {
    isResizing = true;
    document.body.style.cursor = "ew-resize";
  });

  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;

    let newWidth = e.clientX;
    sidebar.style.width = newWidth + "px";
    content.style.marginLeft = newWidth + "px";
  });

  document.addEventListener("mouseup", function () {
    isResizing = false;
    document.body.style.cursor = "default";
  });
});

function clearTable() {
  const searchBar = document.getElementById("tableSearch");
  searchBar.value = "";
  searchBar.focus();
  filterTables();
}

function clearMenu() {
  const searchBar = document.getElementById("menuSearch");
  searchBar.value = "";
  searchBar.focus();
  filterMenu();
}

function allowDrop(event) {
  event.preventDefault();
}

function dragItem(event) {
  const itemData = {
    name: event.target.getAttribute("data-item"),
    price: parseInt(event.target.getAttribute("data-price")),
  };
  event.dataTransfer.setData("item", JSON.stringify(itemData));
}

function dropItem(event) {
  event.preventDefault();
  const tableNumber = event.target.getAttribute("data-table");
  const itemData = JSON.parse(event.dataTransfer.getData("item"));

  orders[tableNumber].push({
    item: itemData.name,
    price: itemData.price,
    servings: 1,
  });

  updateTableInfo(tableNumber);
}

function updateTableInfo(tableNumber) {
  const tableOrders = orders[tableNumber];
  let totalItems = 0;
  let totalPrice = 0;

  tableOrders.forEach((order) => {
    totalItems += order.servings;
    totalPrice += order.price * order.servings;
  });

  document.getElementById(`items-${tableNumber}`).textContent = totalItems;
  document.getElementById(`price-${tableNumber}`).textContent = totalPrice;
}

function openModal(tableNumber) {
  const modal = document.getElementById("orderModal");
  const tableNumEl = document.getElementById("tableNumber");
  const orderDetailsEl = document.getElementById("orderDetails");
  const totalAmountEl = document.getElementById("totalAmount");

  const order = orders[tableNumber];
  tableNumEl.textContent = tableNumber;
  orderDetailsEl.innerHTML = "";
  let total = 0;

  const tableElement = document.querySelector(`[data-table="${tableNumber}"]`);
  tableElement.style.backgroundColor = "orange";

  order.forEach((item, index) => {
    total += item.price * item.servings;
    orderDetailsEl.innerHTML += `
          <tr>
              <td>${index + 1}</td>
              <td>${item.item}</td>
              <td>Rs. ${item.price}</td>
              <td>
                  <input type="number" value="${
                    item.servings
                  }" min="1" onchange="updateServings(${tableNumber}, ${index}, this.value)">
              </td>
              <td><button onclick="removeItem(${tableNumber}, ${index})">🗑️</button></td>
          </tr>
      `;
  });

  totalAmountEl.textContent = total;
  modal.style.display = "block";
}

function updateServings(tableNumber, index, newServings) {
  orders[tableNumber][index].servings = parseInt(newServings);
  updateTableInfo(tableNumber);
  openModal(tableNumber);
}

function removeItem(tableNumber, index) {
  orders[tableNumber].splice(index, 1);
  updateTableInfo(tableNumber);
  openModal(tableNumber);
}

function closeModal() {
  document.getElementById("orderModal").style.display = "none";

  const highlightedTable = document.querySelector(
    '.table-item[style*="background-color: orange"]'
  );
  if (highlightedTable) {
    highlightedTable.style.backgroundColor = "";
  }
}

function generateBill() {
  const tableNumber = document.getElementById("tableNumber").textContent;

  const total = document.getElementById("totalAmount").textContent;
  if (total != 0) {
    alert(`Total Bill for Table ${tableNumber}: Rs. ${total}`);
  } else {
    alert(`No items added to generate the bill`);
  }

  console.log(orders[tableNumber]);
  orders[tableNumber] = [];
  updateTableInfo(tableNumber);
  closeModal();
}

function updateTableInfo(tableNumber) {
  const tableOrders = orders[tableNumber];
  let totalItems = 0;
  let totalPrice = 0;

  tableOrders.forEach((order) => {
    totalItems += order.servings;
    totalPrice += order.price * order.servings;
  });

  document.getElementById(`items-${tableNumber}`).textContent = totalItems;
  document.getElementById(`price-${tableNumber}`).textContent = totalPrice;
}

function filterTables() {
  const searchValue = document
    .getElementById("tableSearch")
    .value.toLowerCase();
  const tables = document.getElementsByClassName("table-item");

  Array.from(tables).forEach((table) => {
    if (table.textContent.toLowerCase().includes(searchValue)) {
      table.style.display = "";
    } else {
      table.style.display = "none";
    }
  });
}

let debounceTimer;

function debounce(func, delay) {
  return function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
  };
}

function filterMenu() {
  const searchValue = document.getElementById("menuSearch").value.toLowerCase();
  const menuItems = document.getElementsByClassName("menu-item");

  Array.from(menuItems).forEach((item) => {
    const itemName = item.getAttribute("data-item").toLowerCase();
    const itemCategory = item.getAttribute("data-category").toLowerCase();

    if (itemName.includes(searchValue) || itemCategory.includes(searchValue)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

document
  .getElementById("menuSearch")
  .addEventListener("keyup", debounce(filterMenu, 1000));

window.onclick = function (event) {
  const modal = document.getElementById("orderModal");
  if (event.target == modal) {
    modal.style.display = "none";
    const activeTable = document.querySelector(
      '.table-item[style*="background-color: orange"]'
    );
    if (activeTable) {
      activeTable.style.backgroundColor = "";
    }
  }
};

document.querySelectorAll(".table-item").forEach((table) => {
  table.addEventListener("click", function () {
    const tableNumber = this.getAttribute("data-table");
    openModal(tableNumber);
  });
});
