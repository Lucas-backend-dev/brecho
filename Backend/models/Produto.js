const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: true,
            unique: true
        },

        nome: {
            type: String,
            required: true
        },

        categoria: {
            type: String,
            required: true
        },

        tamanho: {
            type: String,
            required: true
        },

        estado: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["available", "reserved", "exchanged"],
            default: "available"
        },

        descricao: {
            type: String,
            required: true
        },

        troca: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Produto", produtoSchema);