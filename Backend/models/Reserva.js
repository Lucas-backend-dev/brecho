const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
    {
        nomeCompleto: {
            type: String,
            required: true
        },

        contato: {
            type: String,
            required: true
        },

        codigoProduto: {
            type: String,
            required: true
        },

        nomeProduto: {
            type: String,
            required: true
        },

        tipoDoacao: {
            type: String,
            required: true
        },

        itemDoacao: {
            type: String,
            required: true
        },

        quantidade: {
            type: Number,
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: [
                "Pendente",
                "Em análise",
                "Confirmada",
                "Vendido"
            ],
            default: "Pendente"
        },

        observacoesEquipe: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Reserva", reservaSchema);