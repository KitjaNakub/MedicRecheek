setInterval(() => {
  const now = new Date();
  document.getElementById("time").innerText =
    now.toLocaleTimeString("th-TH");
  document.getElementById("date").innerText =
    now.toLocaleDateString("th-TH");
}, 1000);

const webhookURL = "https://discord.com/api/webhooks/1452735223484780649/XcOZ7OmkPOOxpzsQjvW0dYX3hn4J9SOG4nj-5RXHzHs4nyIOeU0d4_z2ihT0mJ4ULUEU";


// ================================
// ข้อมูลเจ้าหน้าที่และคนยืนยัน
// ================================
let staffList = JSON.parse(localStorage.getItem("staffList")) || [];
let confirmList = JSON.parse(localStorage.getItem("confirmList")) || [];

// ================================
// โหลดรายชื่อไปใส่ select
// ================================
function loadStaffList() {
  const nameSelect = document.getElementById("nameSelect");
  const confirmSelect = document.getElementById("confirmSelect");
  if (!nameSelect || !confirmSelect) return;

  nameSelect.innerHTML = '<option value="">-- เลือกชื่อ --</option>';
  confirmSelect.innerHTML = '<option value="">-- เลือกคนยืนยัน --</option>';

  staffList.forEach(s => {
    const option1 = document.createElement("option");
    option1.value = s.name;
    option1.textContent = s.name;
    nameSelect.appendChild(option1);
  });

  confirmList.forEach(c => {
    const option2 = document.createElement("option");
    option2.value = c.name;
    option2.textContent = c.name;
    confirmSelect.appendChild(option2);
  });
}

// โหลดทันทีเมื่อเปิดหน้า
loadStaffList();
renderConfirmList();
// ================================

dutyStart = new Date();
function sendWebhook(title, description, color = 3066993, imageUrl = null) {
  const embed = {
    title: title,
    description: description,
    color: color,
    footer: {
      text: "Duty System"
    },
    timestamp: new Date()
  };

  // เพิ่มรูปภาพถ้ามี
  if (imageUrl) {
    embed.image = { url: imageUrl };
  }

  fetch(webhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      embeds: [embed]
    })
  })
    .then(response => {
      if (!response.ok) {
        console.error("Webhook failed:", response.status, response.statusText);
        alert("การส่ง Webhook ล้มเหลว");
      } else {
        console.log("Webhook sent successfully!");
      }
    })
    .catch(err => console.error("Webhook error:", err));
}

function uploadToCloudinary(file, callback) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "web_upload"); // ตั้งค่าใน Cloudinary

  fetch("https://api.cloudinary.com/v1_1/dslukyvvm/image/upload", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.secure_url) {
        console.log("Uploaded Image URL:", data.secure_url); // ตรวจสอบ URL ที่ได้
        callback(data.secure_url); // ส่งลิงก์รูปภาพกลับไป
      } else {
        alert("อัปโหลดรูปภาพล้มเหลว");
        console.error("Cloudinary response error:", data);
      }
    })
    .catch(err => console.error("Cloudinary upload error:", err));
}
function checkOut() {
  const name = document.getElementById("nameSelect").value;
  const confirmName = document.getElementById("confirmSelect").value;
  const imageInput = document.getElementById("imageUpload");

  if (!name) return alert("กรุณาเลือกชื่อ");
  if (!confirmName) return alert("กรุณาเลือกคนยืนยัน");

  const staff = staffList.find(s => s.name === name);

  if (!staff) {
    alert("ไม่พบรายชื่อนี้ในระบบ");
    return;
  }

  if (!staff.isOnDuty) {
    alert("รายชื่อนี้ยังไม่ได้เข้าเวร");
    return;
  }

  if (imageInput.files.length === 0) {
    return alert("กรุณาอัปโหลดรูปภาพ");
  }

  const file = imageInput.files[0];

  // อัปโหลดรูปภาพไปยัง Cloudinary
  uploadToCloudinary(file, imageUrl => {
    const dutyEnd = new Date();

    // ดำเนินการออกเวร
    staff.isOnDuty = false;
    staff.totalMinutes += Math.floor((Date.now() - staff.dutyStart) / 60000); // เพิ่มเวลาที่เข้าเวร
    staff.dutyStart = null;

    sendWebhook(
      "🔴 ออกเวร",
      `👤 ชื่อ: ${name}\n👤 คนยืนยัน: ${confirmName}\n⏰ เวลา: ${dutyEnd.toLocaleString("th-TH")}`,
      15158332,
      imageUrl // ใช้ลิงก์รูปภาพที่ได้จาก Cloudinary
    );

    localStorage.setItem("staffList", JSON.stringify(staffList));
    alert("🔴 ลงเวลาออกเวรเรียบร้อยแล้ว!");
  });
}



// ================================
// อัปเดตอัตโนมัติเมื่อ Admin แก้รายชื่อ
// ================================
window.addEventListener("storage", () => {
  staffList = JSON.parse(localStorage.getItem("staffList")) || [];
  loadStaffList();
  
});
