const API_URL = "https://script.google.com/macros/s/AKfycbxas5Cf7_dKcZ7A-msOPidu9n7J3UqaTWkTp4k8oXOGOKo2tuJGAflSCwFwvEfrVhOmVQ/exec";

const servicesGrid = document.getElementById("servicesGrid");
const serviceSelect = document.getElementById("serviceSelect");
const form = document.getElementById("applicationForm");
const formMessage = document.getElementById("formMessage");

let siteServices = [];

window.addEventListener("DOMContentLoaded", loadSiteData);

async function loadSiteData() {
  try {
    const res = await fetch(API_URL + "?action=getData");
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    siteServices = data.services || [];

    renderServices(siteServices);
    renderSelect(siteServices);

  } catch (err) {
    servicesGrid.innerHTML = `<div class="empty">მომსახურებები ამ ეტაპზე არ არის დამატებული.</div>`;
    serviceSelect.innerHTML = `<option value="">მომსახურება ვერ ჩაიტვირთა</option>`;
  }
}

function renderServices(services) {
  if (!services.length) {
    servicesGrid.innerHTML = `<div class="empty">მომსახურებები ამ ეტაპზე არ არის დამატებული.</div>`;
    return;
  }

  servicesGrid.innerHTML = services.map((s) => `
    <article class="service-card liquid-card">
      <div class="service-number">${String(s.id).padStart(2, "0")}</div>
      <h3>${safe(s.title)}</h3>
      ${s.description ? `<p class="preline">${safe(s.description)}</p>` : `<p>დეტალური აღწერა მალე დაემატება.</p>`}
      <a class="mini-btn" href="service.html?id=${encodeURIComponent(s.id)}">დეტალურად ნახვა</a>
    </article>
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

    if (!data.success) throw new Error();

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
