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
        },

        // Imagem armazenada diretamente no MongoDB
        // Agora é opcional
        imagem: {
            type: Buffer
        },

        // Tipo MIME da imagem armazenada
        // Agora é opcional
        imagemContentType: {
            type: String
        },

        // Mantido para compatibilidade com documentos antigos
        imagemPublicId: {
            type: String,
            default: ""
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Produto", produtoSchema);