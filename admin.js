// ===============================
// Discord Webhook
// ===============================
const WEBHOOK_URL = "https://discord.com/api/webhooks/1452979360926793748/ypsrr6WPejaFYeMn5zpsOL5OiTNUgJLW4IWKzPQlddNv3UmqovhADcjeRtz4k3gMXsL9";

function sendWebhook(title, description, color = 3066993) {
  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title,
        description,
        color,
        footer: { text: "Duty System" },
        timestamp: new Date()
      }]
    })
  });
}

// ===============================
// STAFF
// ===============================
let staffList = JSON.parse(localStorage.getItem("staffList")) || [];

function save() {
  localStorage.setItem("staffList", JSON.stringify(staffList));
  render();
}

function render() {
  const table = document.getElementById("staffTable");
  table.innerHTML = "";

  staffList.forEach((s, i) => {
    const h = Math.floor((s.totalMinutes || 0) / 60);
    const m = (s.totalMinutes || 0) % 60;

    let dutyStatus = "⛔ ไม่ได้เข้าเวร";
    let dutyTime = "-";
    let forceBtn = "";

    if (s.isOnDuty && s.dutyStart) {
      dutyStatus = "🟢 กำลังเข้าเวร";
      const minutes = Math.floor((Date.now() - s.dutyStart) / 60000);
      dutyTime = `${minutes} นาที`;
      forceBtn = `<button class="danger" onclick="forceCheckOut(${i})">🚨 Force ออกเวร</button>`;
    }

    table.innerHTML += `
      <tr>
        <td><input value="${s.name}" onchange="editName(${i}, this.value)"></td>
        <td>
          ${h} ชม. ${m} นาที<br>
          <small>${dutyStatus} (${dutyTime})</small>
        </td>
        <td>
          ${forceBtn}
          <button onclick="removeStaff(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });
}

// ➕ เพิ่มเจ้าหน้าที่
function addStaff() {
  const name = document.getElementById("newName").value.trim();
  if (!name) return;

  staffList.push({
    name,
    totalMinutes: 0,
    isOnDuty: false,
    dutyStart: null
  });

  sendWebhook(
    "➕ เพิ่มเจ้าหน้าที่",
    `👤 ชื่อ: ${name}\n🛠 โดย Admin`,
    3447003
  );

  document.getElementById("newName").value = "";
  save();
}

// 🗑 ลบเจ้าหน้าที่
function removeStaff(index) {
  const staffName = staffList[index].name;
  if (!confirm(`ลบ ${staffName} ?`)) return;

  staffList.splice(index, 1);

  sendWebhook(
    "🗑 ลบเจ้าหน้าที่",
    `👤 ชื่อ: ${staffName}`,
    15158332
  );

  save();
}

// ✏️ แก้ชื่อเจ้าหน้าที่
function editName(index, newName) {
  newName = newName.trim();
  if (!newName) return;

  const oldName = staffList[index].name;
  if (oldName === newName) return;

  staffList[index].name = newName;

  sendWebhook(
    "✏️ แก้ไขชื่อเจ้าหน้าที่",
    `จาก: ${oldName}\nเป็น: ${newName}`,
    15844367
  );

  save();
}

// 🚨 Force ออกเวร
function forceCheckOut(index) {
  const staff = staffList[index];
  if (!staff.isOnDuty || !staff.dutyStart) {
    alert("รายชื่อนี้ไม่ได้เข้าเวรอยู่");
    return;
  }

  if (!confirm(`Force ออกเวร: ${staff.name} ?`)) return;

  const elapsedMinutes = Math.floor((Date.now() - staff.dutyStart) / 60000);

  staff.isOnDuty = false;
  staff.dutyStart = null;
  staff.totalMinutes += elapsedMinutes;

  sendWebhook(
    "🚨 Force ออกเวร (Admin)",
    `👤 ชื่อ: ${staff.name}\n⏱️ ระยะเวลา: ${elapsedMinutes} นาที`,
    15105570
  );

  save();
}

// ===============================
// CONFIRM
// ===============================
let confirmList = JSON.parse(localStorage.getItem("confirmList")) || [];

function saveConfirmList() {
  localStorage.setItem("confirmList", JSON.stringify(confirmList));
  renderConfirmList();
}

function renderConfirmList() {
  const table = document.getElementById("confirmTable");
  table.innerHTML = "";

  confirmList.forEach((c, i) => {
    table.innerHTML += `
      <tr>
        <td><input value="${c.name}" onchange="editConfirm(${i}, this.value)"></td>
        <td><button onclick="removeConfirm(${i})">🗑️</button></td>
      </tr>
    `;
  });
}

// ➕ เพิ่มผู้ยืนยัน
function addConfirm() {
  const input = document.getElementById("newConfirmName");
  const name = input.value.trim();
  if (!name) return;

  confirmList.push({ name });

  sendWebhook(
    "➕ เพิ่มผู้ยืนยัน",
    `👤 ชื่อ: ${name}\n🛠 โดย Admin`,
    3447003
  );

  input.value = "";
  saveConfirmList();
}

// ✏️ แก้ชื่อผู้ยืนยัน
function editConfirm(index, newName) {
  newName = newName.trim();
  if (!newName) return;

  const oldName = confirmList[index].name;
  if (oldName === newName) return;

  confirmList[index].name = newName;

  sendWebhook(
    "✏️ แก้ไขชื่อผู้ยืนยัน",
    `จาก: ${oldName}\nเป็น: ${newName}`,
    15844367
  );

  saveConfirmList();
}

// 🗑 ลบผู้ยืนยัน
function removeConfirm(index) {
  const name = confirmList[index].name;
  if (!confirm(`ลบ ${name} ?`)) return;

  confirmList.splice(index, 1);

  sendWebhook(
    "🗑 ลบผู้ยืนยัน",
    `👤 ชื่อ: ${name}`,
    15158332
  );

  saveConfirmList();
}

// ===============================
// INIT
// ===============================
render();
renderConfirmList();

window.addEventListener("storage", () => {
  staffList = JSON.parse(localStorage.getItem("staffList")) || [];
  confirmList = JSON.parse(localStorage.getItem("confirmList")) || [];
  render();
  renderConfirmList();

  const pass = "kitjap5rr"; // 🔑 ตั้งรหัสตรงนี้

  if (!sessionStorage.getItem("admin")) {
    const input = prompt("กรุณาใส่รหัสผ่าน Admin");

    if (input !== pass) {
      alert("รหัสผ่านไม่ถูกต้อง");
      window.location.href = "index.html";
    } else {
      sessionStorage.setItem("admin", "true");
    }
  }
});
