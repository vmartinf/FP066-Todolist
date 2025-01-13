const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

// Modelo de Mongoose (Definido directamente para mayor simplicidad)
const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Project = mongoose.model('Project', ProjectSchema);

// Esquema de GraphQL
const typeDefs = gql`
    type Project {
        id: ID!
        name: String!
        description: String!
        createdAt: String!
    }

    type Query {
        getProjects: [Project]
    }

    type Mutation {
        addProject(name: String!, description: String!): Project
    }
`;

// Resolvers Definidos Directamente
const resolvers = {
    Query: {
        // Obtener todos los proyectos
        getProjects: async () => {
            try {
                return await Project.find();
            } catch (error) {
                throw new Error('Error al obtener los proyectos');
            }
        },
    },
    Mutation: {
        // Añadir un nuevo proyecto
        addProject: async (_, { name, description }) => {
            try {
                const newProject = new Project({ name, description });
                return await newProject.save();
            } catch (error) {
                throw new Error('Error al guardar el proyecto');
            }
        },
    },
};

// Configurar Apollo Server
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
    server.applyMiddleware({ app });

    // Conectar con MongoDB
    mongoose
        .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Conectado a MongoDB');
            app.listen(4000, () => {
                console.log('Servidor ejecutándose en http://localhost:4000/graphql');
            });
        })
        .catch((err) => console.error('Error conectando a MongoDB:', err));
});
