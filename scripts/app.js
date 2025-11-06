// scripts/app.js

// -------- Utilidades de almacenamiento --------
const STORAGE_KEY = "crud_estudiantes_v1";

/** Obtiene todos los estudiantes desde localStorage */
function getStudents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Guarda el arreglo de estudiantes en localStorage */
function setStudents(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Genera un ID simple */
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// -------- Elementos del DOM --------
const form = document.getElementById("student-form");
const inputId = document.getElementById("student-id");
const inputNombre = document.getElementById("nombre");
const inputApellido = document.getElementById("apellido");
const inputEmail = document.getElementById("email");
const inputCarrera = document.getElementById("carrera");
const tbody = document.getElementById("students-tbody");
const countLabel = document.getElementById("count-label");
const searchInput = document.getElementById("search");
const resetBtn = document.getElementById("reset-btn");
const seedBtn = document.getElementById("seed-btn");

// -------- Estado / Filtros --------
let query = "";

// -------- Render de tabla --------
function renderTable() {
  const students = getStudents();
  const filtered = students.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.nombre.toLowerCase().includes(q) ||
      s.apellido.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" class="text-center text-muted py-4">Sin resultados</td>`;
    tbody.appendChild(tr);
  } else {
    filtered.forEach((s, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(s.nombre)}</td>
        <td>${escapeHtml(s.apellido)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td>${escapeHtml(s.carrera)}</td>
        <td class="text-end">
          <button class="btn-icon me-1" title="Editar" data-action="edit" data-id="${s.id}">
            ✏️
          </button>
          <button class="btn-icon" title="Eliminar" data-action="delete" data-id="${s.id}">
            🗑️
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  countLabel.textContent = `${filtered.length} estudiante(s) mostrado(s) • Total: ${students.length}`;
}

/** Evita inyección en celdas por si escriben HTML */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// -------- CRUD --------
function createStudent(data) {
  const list = getStudents();
  list.push({ id: newId(), ...data });
  setStudents(list);
  renderTable();
}

function updateStudent(id, data) {
  const list = getStudents().map((s) => (s.id === id ? { ...s, ...data } : s));
  setStudents(list);
  renderTable();
}

function deleteStudent(id) {
  const list = getStudents().filter((s) => s.id !== id);
  setStudents(list);
  renderTable();
}

function getById(id) {
  return getStudents().find((s) => s.id === id) || null;
}

// -------- Formulario --------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validación nativa + simple
  const valid =
    inputNombre.value.trim() &&
    inputApellido.value.trim() &&
    inputCarrera.value.trim() &&
    inputEmail.validity.valid;

  // Bootstrap: mostrar feedback si es inválido
  [inputNombre, inputApellido, inputCarrera, inputEmail].forEach((el) => {
    if (!el.value.trim() || (el === inputEmail && !el.validity.valid)) {
      el.classList.add("is-invalid");
    } else {
      el.classList.remove("is-invalid");
    }
  });

  if (!valid) return;

  const data = {
    nombre: inputNombre.value.trim(),
    apellido: inputApellido.value.trim(),
    email: inputEmail.value.trim(),
    carrera: inputCarrera.value.trim(),
  };

  const id = inputId.value;
  if (id) {
    updateStudent(id, data);
  } else {
    createStudent(data);
  }

  clearForm();
});

resetBtn.addEventListener("click", clearForm);

function clearForm() {
  inputId.value = "";
  form.reset();
  [inputNombre, inputApellido, inputCarrera, inputEmail].forEach((el) =>
    el.classList.remove("is-invalid")
  );
  document.getElementById("submit-btn").textContent = "Guardar";
}

// -------- Acciones en tabla (delegación de eventos) --------
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "edit") {
    const s = getById(id);
    if (!s) return;
    inputId.value = s.id;
    inputNombre.value = s.nombre;
    inputApellido.value = s.apellido;
    inputEmail.value = s.email;
    inputCarrera.value = s.carrera;
    document.getElementById("submit-btn").textContent = "Actualizar";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (action === "delete") {
    const ok = confirm("¿Eliminar este estudiante?");
    if (ok) {
      deleteStudent(id);
      if (inputId.value === id) clearForm();
    }
  }
});

// -------- Búsqueda --------
searchInput.addEventListener("input", (e) => {
  query = e.target.value || "";
  renderTable();
});

// -------- Carga de estudiantes simulados --------
seedBtn.addEventListener("click", () => {
  const seeded = [
    { id: newId(), nombre: "Ana",   apellido: "López",   email: "ana.lopez@example.com",   carrera: "Ingeniería" },
    { id: newId(), nombre: "Luis",  apellido: "Martínez",email: "l.martinez@example.com",  carrera: "Medicina" },
    { id: newId(), nombre: "Sofía", apellido: "García",  email: "sofia.garcia@example.com", carrera: "Arquitectura" },
    { id: newId(), nombre: "Diego", apellido: "Ramos",   email: "diego.ramos@example.com",  carrera: "Derecho" }
  ];
  const current = getStudents();
  setStudents([...current, ...seeded]);
  renderTable();
});

// -------- Init --------
document.addEventListener("DOMContentLoaded", () => {
  renderTable();
});
