// Esperar a que el DOM esté listo
// Método que escucha eventos del HTML y se dispara cuando el HTML ha sido cargado completamente.
document.addEventListener('DOMContentLoaded', () => {
    console.log("JavaScript cargado correctamente"); // Método que muestra por pantalla un mensaje

    // Seleccionar el contenedor principal
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="row">
            <div class="col-12 text-end mb-3">
                <button class="btn btn-success" id="newProjectBtn">+ Nuevo Proyecto</button>
            </div>
            <div id="projectsContainer" class="row">
                <!-- Aquí se mostrarán los proyectos -->
            </div>
        </div>
    `;

    // Cargar proyectos desde localStorage al iniciar la aplicación
    loadProjects();

    // Vincular el botón "Nuevo Proyecto" para abrir el modal
    const newProjectBtn = document.getElementById('newProjectBtn');
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));

    newProjectBtn.addEventListener('click', () => {
        modal.show();
    });

    // Guardar proyecto cuando se presiona el botón "Guardar"
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    saveProjectBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevenir recarga de la página al enviar el formulario

        const name = document.getElementById('projectName').value; // Obtener el nombre del proyecto
        const description = document.getElementById('projectDescription').value; // Obtener la descripción del proyecto

        if (name && description) {
            addProject(name, description); // Añadir el proyecto al Dashboard
            modal.hide(); // Cerrar el modal
            document.getElementById('projectForm').reset(); // Limpiar el formulario
        } else {
            alert("Por favor, completa todos los campos.");
        }
    });

    // Función para cargar proyectos desde localStorage
    // Recupera y muestra los proyectos almacenados al iniciar la aplicación
    function loadProjects() {
        const projects = JSON.parse(localStorage.getItem('projects')) || []; // Obtener proyectos o un array vacío si no existen
        projects.forEach(project => {
            addProject(project.name, project.description, false); // Añadir cada proyecto al Dashboard sin guardar en localStorage de nuevo
        });
    }

    // Función para añadir un proyecto al Dashboard
    // Recibe el nombre y descripción del proyecto
    // "saveToStorage" indica si debe guardarse en localStorage
    function addProject(name, description, saveToStorage = true) {
        const projectsContainer = document.getElementById('projectsContainer');
        const projectHTML = `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text">${description}</p>
                        <button class="btn btn-primary">Ver Tareas</button>
                        <button class="btn btn-danger deleteProjectBtn">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
        projectsContainer.innerHTML += projectHTML; // Añadir el HTML del proyecto al contenedor

        // Guardar en localStorage si es necesario
        if (saveToStorage) {
            saveProjectToStorage(name, description);
        }

        // Agregar evento para eliminar el proyecto
        addDeleteEvent();
    }

    // Función para guardar un proyecto en localStorage
    // Agrega el proyecto al array de proyectos en localStorage
    function saveProjectToStorage(name, description) {
        const projects = JSON.parse(localStorage.getItem('projects')) || []; // Obtener proyectos existentes o un array vacío
        projects.push({ name, description }); // Añadir el nuevo proyecto
        localStorage.setItem('projects', JSON.stringify(projects)); // Actualizar localStorage
    }

    // Función para agregar eventos a los botones "Eliminar"
    // Permite eliminar proyectos del Dashboard y localStorage
    function addDeleteEvent() {
        const deleteButtons = document.querySelectorAll('.deleteProjectBtn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const card = event.target.closest('.col-md-4'); // Seleccionar la tarjeta del proyecto
                const projectName = card.querySelector('.card-title').textContent; // Obtener el nombre del proyecto

                // Eliminar del DOM
                card.remove();

                // Eliminar del localStorage
                removeProjectFromStorage(projectName);
            });
        });
    }

    // Función para eliminar un proyecto de localStorage
    // Filtra el proyecto eliminado del array almacenado
    function removeProjectFromStorage(name) {
        const projects = JSON.parse(localStorage.getItem('projects')) || []; // Obtener proyectos existentes
        const updatedProjects = projects.filter(project => project.name !== name); // Filtrar el proyecto a eliminar
        localStorage.setItem('projects', JSON.stringify(updatedProjects)); // Actualizar localStorage
    }
});

// Propósito General del Código
// - Asegurar que el DOM esté listo antes de interactuar con él.
// - Seleccionar un elemento del DOM (#app) donde se mostrará contenido dinámico.
// - Cargar proyectos almacenados en localStorage al iniciar la aplicación.
// - Insertar contenido HTML dinámicamente para inicializar la interfaz.
// - Permitir la creación, visualización y eliminación de proyectos dinámicamente.
