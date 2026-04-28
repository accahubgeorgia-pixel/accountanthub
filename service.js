const API_URL = "https://script.google.com/macros/s/AKfycbxas5Cf7_dKcZ7A-msOPidu9n7J3UqaTWkTp4k8oXOGOKo2tuJGAflSCwFwvEfrVhOmVQ/exec";

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

  try {
    const res = await fetch(API_URL + "?action=getData");
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

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

  } catch (err) {
    serviceTitle.textContent = "მონაცემები ვერ ჩაიტვირთა";
    serviceDescription.textContent = "დაფიქსირდა შეცდომა. სცადეთ მოგვიანებით.";
    syllabusGrid.innerHTML = `<div class="empty">სილაბუსი ვერ ჩაიტვირთა.</div>`;
  }
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

function safe(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
