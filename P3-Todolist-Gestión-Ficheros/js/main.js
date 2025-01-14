// Archivo: main.js

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log("JavaScript cargado correctamente");
    // Este evento asegura que el DOM esté completamente cargado antes de ejecutar el código JS.
    // Es útil para evitar errores de referencia a elementos que aún no existen.

    // Cargar proyectos desde el backend al iniciar la aplicación
    //============================================================
    loadProjects();
    // Función que obtiene proyectos desde el backend y los muestra en el frontend.
    // Se ejecuta al inicio de la aplicación.

    // Vincular el botón "Nuevo Proyecto" para abrir el modal
     //============================================================
    const newProjectBtn = document.getElementById('newProjectBtn');
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
     // Se selecciona el botón para abrir el modal y se inicializa el modal con Bootstrap.

    // Evento para mostrar el modal cuando se hace clic en el botón "Nuevo Proyecto"
     //============================================================
    newProjectBtn.addEventListener('click', () => {
        modal.show();
    });
    // Evento para abrir el modal cuando se hace clic en el botón "Nuevo Proyecto".
    // Esto mejora la experiencia de usuario al evitar recargar la página.

    // Guardar proyecto cuando se presiona el botón "Guardar"
     //============================================================
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    saveProjectBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        // Previene el comportamiento por defecto del formulario (recargar la página).
        const name = document.getElementById('projectName').value;
        const description = document.getElementById('projectDescription').value;
        // Obtiene los valores del formulario para crear un nuevo proyecto
        if (name && description) {
            try {
                const mutation = `
                    mutation {
                        addProject(name: "${name}", description: "${description}") {
                            id
                            name
                            description
                        }
                    }
                `;

                const response = await fetch('http://localhost:4000/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: mutation }),
                });

                const result = await response.json();
                console.log('Proyecto añadido:', result.data.addProject);

                addProject(result.data.addProject.name, result.data.addProject.description, false, result.data.addProject.id, 'pending');
                modal.hide();
                document.getElementById('projectForm').reset();
            } catch (error) {
                console.error('Error al añadir proyecto:', error);
            }
        } else {
            alert("Por favor, completa todos los campos.");
        }
    });
    // Verifica que el formulario esté completo, envía una mutación GraphQL para guardar el proyecto en el backend,
    // y actualiza la interfaz con el nuevo proyecto.
    //============================================================
    async function loadProjects() {
        try {
            const query = `
                query {
                    getProjects {
                        id
                        name
                        description
                    }
                }
            `;

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const result = await response.json();
            const projects = result.data.getProjects;

            projects.forEach((project, index) => {
                const columnId = index % 2 === 0 ? 'pending' : 'inProgress';
                addProject(project.name, project.description, false, project.id, columnId);
            });

            enableDragAndDrop();
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
        }
    }
    // Función que obtiene todos los proyectos mediante una consulta GraphQL
    // y los añade a las columnas de la interfaz.
    //============================================================
    function addProject(name, description, saveToStorage = true, id = null, columnId = 'pending') {
        const column = document.getElementById(columnId);
        const projectHTML = `
            <div class="task-card mb-3" data-id="${id}" draggable="true">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text">${description}</p>
                        <button class="btn btn-danger deleteProjectBtn">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
        column.innerHTML += projectHTML;

        addDeleteEvent();
        enableDragAndDrop();
    }
    // Crea y añade un nuevo proyecto a una columna específica en la interfaz.
    // Permite drag and drop y elimina eventos asociados.
    //============================================================
    function enableDragAndDrop() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.task-column');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
                e.target.classList.add('dragging');
            });

            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData('text/plain');
                const card = document.querySelector(`.task-card[data-id="${cardId}"]`);
                if (card && column) {
                    column.appendChild(card);
                }
                column.classList.remove('drag-over');
            });
        });
    }
    // Implementa la funcionalidad de arrastrar y soltar para las tareas entre columnas.
     //============================================================
    function addDeleteEvent() {
        const deleteButtons = document.querySelectorAll('.deleteProjectBtn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const card = event.target.closest('.task-card');
                const projectId = card.dataset.id;

                try {
                    const mutation = `
                        mutation {
                            deleteProject(id: "${projectId}")
                        }
                    `;
                    await fetch('http://localhost:4000/graphql', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: mutation }),
                    });

                    card.remove();
                    console.log('Proyecto eliminado:', projectId);
                } catch (error) {
                    console.error('Error al eliminar el proyecto:', error);
                }
            });
        });
    }
    // Añade eventos a los botones para eliminar proyectos, realiza una mutación
    // GraphQL y actualiza la interfaz.
});
