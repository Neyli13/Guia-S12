// ====================== VARIABLES ======================
const tabla = document.getElementById("tablaEstudiantes");
const form = document.getElementById("formEstudiante");
const idInput = document.getElementById("id");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const edadInput = document.getElementById("edad");
const idEstudianteInput = document.getElementById("idEstudiante");
const estadoInput = document.getElementById("estadoEstudiante");

const API = "http://localhost:1337/api/estudiantes";

// Normaliza un item (plano o con attributes)
function mapItem(item) {
    const a = item.attributes || item;
    return {
        id: item.id,
        docId: item.documentId || item.id,
        Nombre: a.Nombre,
        Apellido: a.Apellido,
        Edad: a.Edad ?? a.edad,
        IdEstudiante: a.IdEstudiante ?? a.idEstudiante,
        Estudiante_Activo: a.Estudiante_Activo ?? a.estadoEstudiante ?? false
    };
}

// ====================== GET ======================
async function obtenerEstudiantes() {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Error al obtener los datos.");
        const json = await response.json();
        const arr = Array.isArray(json.data) ? json.data.map(mapItem) : [];
        return arr;
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        return [];
    }
}

// ====================== CARGAR TABLA ======================
function cargarTabla(estudiantes) {
    tabla.innerHTML = "";
    if (estudiantes.length === 0) {
        tabla.innerHTML = "<tr><td colspan='6' class='text-center'>No hay estudiantes registrados.</td></tr>";
        return;
    }

    estudiantes.forEach((est) => {
        const fila = `
        <tr data-document-id="${est.docId}">
            <td>${est.IdEstudiante ?? ""}</td>
            <td>${est.Nombre ?? ""}</td>
            <td>${est.Apellido ?? ""}</td>
            <td>${est.Edad ?? ""}</td>
            <td>${est.Estudiante_Activo ? "Activo" : "Inactivo"}</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-editar">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
                </td>
        </tr>`;
        tabla.insertAdjacentHTML("beforeend", fila);
    });
}

// ====================== POST ======================
async function agregarEstudiante(estudiante) {
    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: estudiante }),
        });
        if (!response.ok) throw new Error("Error al agregar el estudiante.");
        await init();
        form.reset();
        idInput.value = "";
    } catch (error) {
        console.error("Error en agregarEstudiante:", error);
    }
}

// ====================== PUT ======================
async function actualizarEstudiante(docId, estudiante) {
    try {
        const response = await fetch(`${API}/${docId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: estudiante }),
        });
        if (!response.ok) throw new Error("Error al actualizar el estudiante.");
    } catch (error) {
        console.error("Error en actualizarEstudiante:", error);
    }
}

// ====================== DELETE ======================
async function eliminarEstudiante(docId) {
    try {
        const response = await fetch(`${API}/${docId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Error al eliminar el estudiante.");
    } catch (error) {
        console.error("Error en eliminarEstudiante:", error);
    }
}

// ====================== EVENTOS DE TABLA ======================
tabla.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-editar")) {
        const fila = e.target.closest("tr");
        const docId = fila.dataset.documentId;
        const tds = fila.querySelectorAll("td");

        idInput.value = docId;
        idEstudianteInput.value = (tds[0].textContent || "").trim();
        nombreInput.value = (tds[1].textContent || "").trim();
        apellidoInput.value = (tds[2].textContent || "").trim();
        edadInput.value = (tds[3].textContent || "").trim();
        estadoInput.checked = ((tds[4].textContent || "").trim().toLowerCase() === "activo");

    } else if (e.target.classList.contains("btn-eliminar")) {
        const fila = e.target.closest("tr");
        const docId = fila.dataset.documentId;
        if (confirm("¿Estás seguro de que quieres eliminar este estudiante?")) {
            await eliminarEstudiante(docId);
            await init();
        }
    }
});

// ====================== EVENTO SUBMIT ======================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const docId = idInput.value;
    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const edad = edadInput.value.trim();
    const idEst = idEstudianteInput.value.trim();
    const activo = !!estadoInput.checked;

    if (!nombre || !apellido || !edad || !idEst) {
        alert("Por favor, completa Nombre, Apellido, Edad e ID Estudiante.");
        return;
    }

    // Usa las claves exactas que maneja tu API
    const estudianteData = {
        Nombre: nombre,
        Apellido: apellido,
        Edad: parseInt(edad, 10),
        IdEstudiante: idEst,
        Estudiante_Activo: activo
    };

    if (docId) {
        await actualizarEstudiante(docId, estudianteData);
    } else {
        await agregarEstudiante(estudianteData);
    }

    form.reset();
    idInput.value = "";
    await init();
});

// ====================== INICIALIZAR ======================
async function init() {
    const estudiantes = await obtenerEstudiantes();
    cargarTabla(estudiantes);
}
init();