const API_URL = "https://script.google.com/macros/s/AKfycbxas5Cf7_dKcZ7A-msOPidu9n7J3UqaTWkTp4k8oXOGOKo2tuJGAflSCwFwvEfrVhOmVQ/exec";

const CACHE_KEY = "accountanthub_site_data";
const CACHE_TIME_KEY = "accountanthub_site_data_time";
const LOCAL_CACHE_MINUTES = 10;

const servicesGrid = document.getElementById("servicesGrid");
const serviceSelect = document.getElementById("serviceSelect");
const form = document.getElementById("applicationForm");
const formMessage = document.getElementById("formMessage");

window.addEventListener("DOMContentLoaded", loadSiteData);

async function loadSiteData() {
  const cachedData = getLocalCache();

  if (cachedData) {
    renderServices(cachedData.services || []);
    renderSelect(cachedData.services || []);
  }

  try {
    const res = await fetch(API_URL + "?action=getData&v=" + Date.now());
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    setLocalCache(data);

    renderServices(data.services || []);
    renderSelect(data.services || []);

  } catch (err) {
    if (!cachedData) {
      servicesGrid.innerHTML = `<div class="empty">მომსახურებები ამ ეტაპზე არ არის დამატებული.</div>`;
      serviceSelect.innerHTML = `<option value="">მომსახურება ვერ ჩაიტვირთა</option>`;
    }
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

function getLocalCache() {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    const savedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (!saved || !savedTime) return null;

    const ageMinutes = (Date.now() - Number(savedTime)) / 1000 / 60;

    if (ageMinutes > LOCAL_CACHE_MINUTES) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      return null;
    }

    return JSON.parse(saved);

  } catch (err) {
    return null;
  }
}

function setLocalCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
}

function safe(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
