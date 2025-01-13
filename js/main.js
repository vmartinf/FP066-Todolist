// Esperar a que el DOM esté listo
// Método que escucha eventos del HTML y se dispara cuando el HTML ha sido cargado completamente.
document.addEventListener('DOMContentLoaded', () => {
    console.log("JavaScript cargado correctamente"); // Confirmación en la consola

    // Cargar proyectos desde el backend al iniciar la aplicación
    loadProjects();

    // Vincular el botón "Nuevo Proyecto" para abrir el modal
    const newProjectBtn = document.getElementById('newProjectBtn');
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));

    newProjectBtn.addEventListener('click', () => {
        modal.show(); // Mostrar el modal
    });

    // Guardar proyecto cuando se presiona el botón "Guardar"
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    saveProjectBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Evitar la recarga de la página

        const name = document.getElementById('projectName').value; // Nombre del proyecto
        const description = document.getElementById('projectDescription').value; // Descripción del proyecto

        if (name && description) {
            try {
                // Mutación GraphQL para añadir un proyecto al backend
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

                // Añadir el proyecto a la columna "Pendientes"
                addProject(result.data.addProject.name, result.data.addProject.description, false, result.data.addProject.id, 'pending');
                modal.hide(); // Cerrar el modal
                document.getElementById('projectForm').reset(); // Limpiar el formulario
            } catch (error) {
                console.error('Error al añadir proyecto:', error);
            }
        } else {
            alert("Por favor, completa todos los campos.");
        }
    });

    // Función para cargar proyectos desde el backend
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
                // Distribuir los proyectos entre las columnas (puedes ajustar la lógica aquí)
                const columnId = index % 3 === 0 ? 'pending' : index % 3 === 1 ? 'inProgress' : 'completed';
                addProject(project.name, project.description, false, project.id, columnId);
            });

            enableDragAndDrop(); // Habilitar Drag & Drop después de cargar los proyectos
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
        }
    }

    // Función para añadir un proyecto al Dashboard
    function addProject(name, description, saveToStorage = true, id = null, columnId = 'pending') {
        const column = document.getElementById(columnId); // Seleccionar la columna correspondiente
        const projectHTML = `
            <div class="task-card mb-3" data-id="${id}" draggable="true">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text">${description}</p>
                        <button class="btn btn-primary editProjectBtn">Editar</button>
                        <button class="btn btn-danger deleteProjectBtn">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
        column.innerHTML += projectHTML;

        addDeleteEvent(); // Evento para eliminar
        addEditEvent();   // Evento para editar
        enableDragAndDrop(); // Habilitar Drag & Drop para la nueva tarjeta
    }

    // Función para habilitar Drag & Drop
    function enableDragAndDrop() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.task-column');

        cards.forEach(card => {
            card.setAttribute('draggable', true);

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.id); // Guardar el ID de la tarjeta arrastrada
                e.target.classList.add('dragging'); // Añadir clase visual
            });

            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging'); // Quitar clase visual
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault(); // Permitir soltar
                column.classList.add('drag-over'); // Añadir clase visual para indicar aceptación
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over'); // Quitar clase visual
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData('text/plain'); // Obtener el ID de la tarjeta arrastrada
                const card = document.querySelector(`.task-card[data-id="${cardId}"]`);
                column.appendChild(card); // Mover la tarjeta a la nueva columna
                column.classList.remove('drag-over'); // Quitar clase visual
            });
        });
    }

    // Función para agregar eventos a los botones "Eliminar"
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
                    const response = await fetch('http://localhost:4000/graphql', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: mutation }),
                    });

                    const result = await response.json();
                    console.log('Proyecto eliminado:', result.data.deleteProject);

                    card.remove(); // Eliminar del DOM
                } catch (error) {
                    console.error('Error al eliminar el proyecto:', error);
                }
            });
        });
    }

    // Función para agregar eventos a los botones "Editar"
    function addEditEvent() {
        const editButtons = document.querySelectorAll('.editProjectBtn');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const card = event.target.closest('.task-card');
                const projectName = card.querySelector('.card-title').textContent;
                const projectDescription = card.querySelector('.card-text').textContent;

                document.getElementById('projectName').value = projectName;
                document.getElementById('projectDescription').value = projectDescription;

                const modal = new bootstrap.Modal(document.getElementById('projectModal'));
                modal.show();

                const saveProjectBtn = document.getElementById('saveProjectBtn');
                saveProjectBtn.addEventListener('click', async (event) => {
                    event.preventDefault();

                    const newName = document.getElementById('projectName').value;
                    const newDescription = document.getElementById('projectDescription').value;

                    try {
                        const mutation = `
                            mutation {
                                updateProject(id: "${card.dataset.id}", name: "${newName}", description: "${newDescription}") {
                                    id
                                    name
                                    description
                                }
                            }
                        `;
                        const response = await fetch('http://localhost:4000/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: mutation }),
                        });

                        const result = await response.json();
                        console.log('Proyecto actualizado:', result.data.updateProject);

                        card.querySelector('.card-title').textContent = newName;
                        card.querySelector('.card-text').textContent = newDescription;

                        modal.hide();
                        document.getElementById('projectForm').reset();
                    } catch (error) {
                        console.error('Error al actualizar el proyecto:', error);
                    }
                });
            });
        });
    }
});

// Propósito General del Código
// - Asegurar que el DOM esté listo antes de interactuar con él.
// - Seleccionar un elemento del DOM (#app) donde se mostrará contenido dinámico.
// - Cargar proyectos desde el backend al iniciar la aplicación.
// - Insertar contenido HTML dinámicamente para inicializar la interfaz.
// - Permitir la creación, actualización y eliminación de proyectos dinámicamente.
// - Implementar funcionalidad de Drag & Drop para organizar las tareas en columnas.
// - Integrar el front-end con el back-end usando fetch y GraphQL.
