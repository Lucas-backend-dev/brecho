const mongoose = require("mongoose");

const avaliacaoSchema = new mongoose.Schema(
    {
        nota: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        facilidade: {
            type: String,
            default: ""
        },

        satisfacao: {
            type: String,
            default: ""
        },

        participariaNovamente: {
            type: String,
            default: ""
        },

        recomendaria: {
            type: String,
            default: ""
        },

        sugestao: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Avaliacao", avaliacaoSchema);