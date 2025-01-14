//Importar Mongoose
const mongoose = require('mongoose');

// Definir el esquema para los proyectos
const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Exportar el modelo
module.exports = mongoose.model('Project', ProjectSchema);
