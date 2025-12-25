setInterval(() => {
  const now = new Date();
  document.getElementById("time").innerText =
    now.toLocaleTimeString("th-TH");
  document.getElementById("date").innerText =
    now.toLocaleDateString("th-TH");
}, 1000);

const webhookURL = "https://discord.com/api/webhooks/1452735223484780649/XcOZ7OmkPOOxpzsQjvW0dYX3hn4J9SOG4nj-5RXHzHs4nyIOeU0d4_z2ihT0mJ4ULUEU";

// ================================
// ข้อมูลเจ้าหน้าที่ (จาก Admin)
// ================================
let staffList = JSON.parse(localStorage.getItem("staffList")) || [];

// ================================
// โหลดรายชื่อไปใส่ select
// ================================
function loadStaffList() {
  const select = document.getElementById("nameSelect");
  if (!select) return;

  select.innerHTML = '<option value="">-- เลือกชื่อ --</option>';

  staffList.forEach(s => {
    const option = document.createElement("option");
    option.value = s.name;
    option.textContent = s.name;
    select.appendChild(option);
  });
}

// โหลดทันทีเมื่อเปิดหน้า
loadStaffList();

// ================================
// เข้าเวร / ออกเวร
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

function checkIn() {
  const name = document.getElementById("nameSelect").value;
  const imageInput = document.getElementById("imageUpload");

  if (!name) return alert("กรุณาเลือกชื่อ");

  const staff = staffList.find(s => s.name === name);
  if (!staff) return alert("ไม่พบรายชื่อนี้ในระบบ");

  if (staff.isOnDuty) {
    return alert("ชื่อนี้เข้าเวรอยู่แล้ว");
  }

  if (imageInput.files.length === 0) {
    return alert("กรุณาอัปโหลดรูปภาพ");
  }

  uploadToCloudinary(imageInput.files[0], imageUrl => {
    staff.isOnDuty = true;
    staff.dutyStart = Date.now();

    // อัปเดต localStorage
    localStorage.setItem("staffList", JSON.stringify(staffList));

    sendWebhook(
      "🟢 เข้าเวรหน่วยพิเศษ",
      `👤 ชื่อ: ${name}\n⏰ เวลา: ${new Date(staff.dutyStart).toLocaleString("th-TH")}`,
      5763719,
      imageUrl
    );

    alert("🟢 ลงเวลาเข้าเวรเรียบร้อยแล้ว!");
  });
}


// ================================
// อัปเดตอัตโนมัติเมื่อ Admin แก้รายชื่อ
// ================================
window.addEventListener("storage", () => {
  staffList = JSON.parse(localStorage.getItem("staffList")) || [];
  loadStaffList();
});
