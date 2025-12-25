// ฟังก์ชันสำหรับนำทางไปยังหน้า checkin.html
function checkIn() {
  window.location.href = "./Checkin/checkin.html";
}

// ฟังก์ชันสำหรับนำทางไปยังหน้า checkout.html (ถ้ามี)
function checkOut() {
  window.location.href = "./Checkout/checkout.html"; // สร้างไฟล์ checkout.html ถ้ายังไม่มี
}

const firebaseConfig = {
  apiKey: "AIzaSyBZuU31DggzKf_X6pBr86O_bj8ZuyKy7Jk",
  authDomain: "webmd23-ddf89.firebaseapp.com",
  databaseURL: "https://webmd23-ddf89.firebaseio.com",
  projectId: "webmd23-ddf89",
  storageBucket: "webmd23-ddf89.firebasestorage.app",
  messagingSenderId: "70018340688",
  appId: "1:70018340688:web:72891ef8dde34ad0e3fe55"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ดึงข้อมูลเจ้าหน้าที่จาก Firebase
function fetchStaffList() {
  db.ref("staffList").on("value", snapshot => {
    const staffList = snapshot.val() || [];
    renderStaffList(staffList);
  });
}

// เพิ่มเจ้าหน้าที่
function addStaff(name) {
  const newStaff = { name, isOnDuty: false, totalMinutes: 0 };
  db.ref("staffList").push(newStaff);
}

// อัปเดตสถานะเข้า/ออกเวร
function updateStaffStatus(key, isOnDuty, totalMinutes) {
  db.ref(`staffList/${key}`).update({ isOnDuty, totalMinutes });
}

fetchStaffList(); // เรียกใช้เมื่อโหลดหน้าเว็บ

function renderStaffList(staffList) {
  const table = document.getElementById("staffTable");
  table.innerHTML = "";

  Object.keys(staffList).forEach(key => {
    const staff = staffList[key];
    const dutyStatus = staff.isOnDuty ? "🟢 กำลังเข้าเวร" : "⛔ ไม่ได้เข้าเวร";
    const totalMinutes = staff.totalMinutes || 0;

    table.innerHTML += `
      <tr>
        <td>${staff.name}</td>
        <td>${totalMinutes} นาที</td>
        <td>${dutyStatus}</td>
        <td>
          <button onclick="updateStaffStatus('${key}', false, ${totalMinutes})">🔴 ออกเวร</button>
        </td>
      </tr>
    `;
  });
}
