const API_URL = "https://script.google.com/macros/s/AKfycbxas5Cf7_dKcZ7A-msOPidu9n7J3UqaTWkTp4k8oXOGOKo2tuJGAflSCwFwvEfrVhOmVQ/exec";

const CACHE_KEY = "accountanthub_site_data";
const CACHE_TIME_KEY = "accountanthub_site_data_time";
const LOCAL_CACHE_MINUTES = 10;

const serviceTitle = document.getElementById("serviceTitle");
const serviceDescription = document.getElementById("serviceDescription");
const syllabusGrid = document.getElementById("syllabusGrid");

window.addEventListener("DOMContentLoaded", loadServicePage);

async function loadServicePage() {
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get("id");

  if (!serviceId) {
    serviceTitle.textContent = "მომსახურება ვერ მოიძებნა";
    serviceDescription.textContent = "გთხოვთ დაბრუნდეთ მთავარ გვერდზე და თავიდან აირჩიოთ მომსახურება.";
    syllabusGrid.innerHTML = `<div class="empty">სილაბუსი ვერ ჩაიტვირთა.</div>`;
    return;
  }

  const cachedData = getLocalCache();

  if (cachedData) {
    renderPageData(cachedData, serviceId);
  }

  try {
    const res = await fetch(API_URL + "?action=getData&v=" + Date.now());
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    setLocalCache(data);
    renderPageData(data, serviceId);

  } catch (err) {
    if (!cachedData) {
      serviceTitle.textContent = "მონაცემები ვერ ჩაიტვირთა";
      serviceDescription.textContent = "დაფიქსირდა შეცდომა. სცადეთ მოგვიანებით.";
      syllabusGrid.innerHTML = `<div class="empty">სილაბუსი ვერ ჩაიტვირთა.</div>`;
    }
  }
}

function renderPageData(data, serviceId) {
  const services = data.services || [];
  const syllabus = data.syllabus || [];

  const service = services.find(item => String(item.id).trim() === String(serviceId).trim());

  if (!service) {
    serviceTitle.textContent = "მომსახურება ვერ მოიძებნა";
    serviceDescription.textContent = "მითითებული მომსახურება არ არსებობს.";
    syllabusGrid.innerHTML = `<div class="empty">სილაბუსი ვერ მოიძებნა.</div>`;
    return;
  }

  serviceTitle.innerHTML = safe(service.title);

  serviceDescription.innerHTML = service.description
    ? safe(service.description)
    : "დეტალური აღწერა მალე დაემატება.";

  const filteredSyllabus = syllabus.filter(item => {
    return String(item.serviceId).trim() === String(serviceId).trim();
  });

  renderSyllabus(filteredSyllabus);
}

function renderSyllabus(rows) {
  if (!rows.length) {
    syllabusGrid.innerHTML = `<div class="empty">ამ მომსახურებისთვის სილაბუსი ჯერ არ არის დამატებული.</div>`;
    return;
  }

  syllabusGrid.innerHTML = rows.map((r, i) => `
    <div class="syllabus-card liquid-card">
      <b>${String(i + 1).padStart(2, "0")}</b>
      <div>
        ${r.col1 ? `<h4 class="preline">${safe(r.col1)}</h4>` : ""}
        ${r.col2 ? `<p class="preline">${safe(r.col2)}</p>` : ""}
        ${r.col3 ? `<p class="preline">${safe(r.col3)}</p>` : ""}
        ${r.col4 ? `<p class="preline">${safe(r.col4)}</p>` : ""}
        ${r.col5 ? `<p class="preline">${safe(r.col5)}</p>` : ""}
      </div>
    </div>
  `).join("");
}

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
