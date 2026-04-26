const API_URL = "https://script.google.com/macros/s/AKfycbxas5Cf7_dKcZ7A-msOPidu9n7J3UqaTWkTp4k8oXOGOKo2tuJGAflSCwFwvEfrVhOmVQ/exec";

const servicesGrid = document.getElementById("servicesGrid");
const syllabusList = document.getElementById("syllabusList");
const serviceSelect = document.getElementById("serviceSelect");
const form = document.getElementById("applicationForm");
const formMessage = document.getElementById("formMessage");

document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

async function loadData() {
  try {
    const response = await fetch(`${API_URL}?action=getData`);
    const result = await response.json();

    renderServices(result.services || []);
    renderSyllabus(result.syllabus || []);
    renderServiceOptions(result.services || []);

  } catch (error) {
    servicesGrid.innerHTML = `<div class="loading">მონაცემების ჩატვირთვა ვერ მოხერხდა.</div>`;
    syllabusList.innerHTML = `<div class="loading">საკითხების ჩატვირთვა ვერ მოხერხდა.</div>`;
    serviceSelect.innerHTML = `<option value="">მომსახურებები ვერ ჩაიტვირთა</option>`;
  }
}

function renderServices(services) {
  if (!services.length) {
    servicesGrid.innerHTML = `<div class="loading">მომსახურებები ჯერ არ არის დამატებული.</div>`;
    return;
  }

  servicesGrid.innerHTML = services.map((item) => `
    <div class="service-card">
      <div class="service-icon">
        <i class="fa-solid fa-chart-line"></i>
      </div>

      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.description)}</p>

      <div class="service-details">
        ${item.details.map(detail => detail ? `<span>• ${escapeHTML(detail)}</span>` : "").join("")}
      </div>
    </div>
  `).join("");
}

function renderSyllabus(rows) {
  if (!rows.length) {
    syllabusList.innerHTML = `<div class="loading">სილაბუსის საკითხები ჯერ არ არის დამატებული.</div>`;
    return;
  }

  syllabusList.innerHTML = rows.map(row => `
    <div class="syllabus-row">
      <span>${escapeHTML(row.col1)}</span>
      <span>${escapeHTML(row.col2)}</span>
      <span>${escapeHTML(row.col3)}</span>
      <span>${escapeHTML(row.col4)}</span>
      <span>${escapeHTML(row.col5)}</span>
    </div>
  `).join("");
}

function renderServiceOptions(services) {
  serviceSelect.innerHTML = `<option value="">აირჩიეთ მომსახურება</option>`;

  services.forEach(service => {
    const option = document.createElement("option");
    option.value = service.title;
    option.textContent = service.title;
    serviceSelect.appendChild(option);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  formMessage.textContent = "იგზავნება...";
  formMessage.className = "form-message";

  const formData = new FormData(form);

  const data = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    service: formData.get("service"),
    comment: formData.get("comment")
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      form.reset();
      formMessage.textContent = "განაცხადი წარმატებით გაიგზავნა.";
      formMessage.className = "form-message success";
    } else {
      throw new Error("Submit failed");
    }

  } catch (error) {
    formMessage.textContent = "დაფიქსირდა შეცდომა. სცადეთ თავიდან.";
    formMessage.className = "form-message error";
  }
});

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
