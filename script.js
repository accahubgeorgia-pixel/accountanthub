const API_URL = "https://script.google.com/macros/s/AKfycbxas5Cf7_dKcZ7A-msOPidu9n7J3UqaTWkTp4k8oXOGOKo2tuJGAflSCwFwvEfrVhOmVQ/exec";

const servicesGrid = document.getElementById("servicesGrid");
const syllabusGrid = document.getElementById("syllabusGrid");
const serviceSelect = document.getElementById("serviceSelect");
const form = document.getElementById("applicationForm");
const formMessage = document.getElementById("formMessage");

window.addEventListener("DOMContentLoaded", loadSiteData);

async function loadSiteData() {
  try {
    const res = await fetch(API_URL + "?action=getData");
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Data loading error");
    }

    renderServices(data.services || []);
    renderSyllabus(data.syllabus || []);
    renderSelect(data.services || []);

  } catch (err) {
    servicesGrid.innerHTML = `<div class="empty">მონაცემები ვერ ჩაიტვირთა. შეამოწმე Apps Script და Google Sheet.</div>`;
    syllabusGrid.innerHTML = `<div class="empty">საკითხები ვერ ჩაიტვირთა.</div>`;
    serviceSelect.innerHTML = `<option value="">მონაცემები ვერ ჩაიტვირთა</option>`;
  }
}

function renderServices(services) {
  if (!services.length) {
    servicesGrid.innerHTML = `<div class="empty">მომსახურებები ჯერ არ არის დამატებული.</div>`;
    return;
  }

  servicesGrid.innerHTML = services.map((s, i) => `
    <article class="service-card">
      <div class="service-number">${String(i + 1).padStart(2, "0")}</div>
      <h3>${safe(s.title)}</h3>
      <p>${safe(s.description)}</p>
      <div class="service-tags">
        ${(s.details || []).map(d => d ? `<span>${safe(d)}</span>` : "").join("")}
      </div>
    </article>
  `).join("");
}

function renderSyllabus(rows) {
  if (!rows.length) {
    syllabusGrid.innerHTML = `<div class="empty">საკითხები ჯერ არ არის დამატებული.</div>`;
    return;
  }

  syllabusGrid.innerHTML = rows.map((r, i) => `
    <div class="syllabus-card">
      <b>${String(i + 1).padStart(2, "0")}</b>
      <div>
        <h4>${safe(r.col1)}</h4>
        <p>${safe(r.col2)}</p>
        <small>${safe(r.col3)} ${safe(r.col4)} ${safe(r.col5)}</small>
      </div>
    </div>
  `).join("");
}

function renderSelect(services) {
  serviceSelect.innerHTML = `<option value="">აირჩიეთ მომსახურება</option>`;

  services.forEach(s => {
    if (!s.title) return;

    const option = document.createElement("option");
    option.value = s.title;
    option.textContent = s.title;
    serviceSelect.appendChild(option);
  });
}

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  formMessage.textContent = "იგზავნება...";
  formMessage.className = "form-message";

  const payload = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    service: form.service.value,
    comment: form.comment.value.trim()
  };

  try {
    const body = new FormData();
    body.append("payload", JSON.stringify(payload));

    const res = await fetch(API_URL, {
      method: "POST",
      body: body
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Submit error");
    }

    form.reset();
    formMessage.textContent = "განაცხადი წარმატებით გაიგზავნა.";
    formMessage.className = "form-message success";

  } catch (err) {
    formMessage.textContent = "შეცდომა დაფიქსირდა. სცადეთ თავიდან.";
    formMessage.className = "form-message error";
  }
});

function safe(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
