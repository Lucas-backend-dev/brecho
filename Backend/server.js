const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const Produto = require("./models/Produto");
const Reserva = require("./models/Reserva");
const Avaliacao = require("./models/Avaliacao");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// MIDDLEWARES
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// CONEXÃO COM MONGODB
// ==============================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB conectado com sucesso!");
    })
    .catch((erro) => {
        console.error("Erro ao conectar ao MongoDB:", erro.message);
    });

// ==============================
// ROTA PRINCIPAL
// ==============================

app.get("/", (req, res) => {
    res.json({
        mensagem: "Backend do Brechó Solidário Online funcionando!"
    });
});

// ==============================
// PRODUTOS
// ==============================

// Listar produtos
app.get("/api/produtos", async (req, res) => {
    try {
        const produtos = await Produto.find().sort({ createdAt: -1 });
        res.json(produtos);
    } catch (erro) {
        console.error("ERRO AO BUSCAR PRODUTOS:", erro);
        res.status(500).json({
            mensagem: "Erro ao buscar produtos.",
            erro: erro.message
        });
    }
});

// Criar produto
app.post("/api/produtos", async (req, res) => {
    try {
        const produto = await Produto.create(req.body);

        res.status(201).json(produto);
    } catch (erro) {
        console.error("ERRO AO CRIAR PRODUTO:", erro);

        res.status(400).json({
            mensagem: "Erro ao criar produto.",
            erro: erro.message
        });
    }
});

// Editar produto
app.put("/api/produtos/:id", async (req, res) => {
    try {
        const produto = await Produto.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        res.json(produto);
    } catch (erro) {
        console.error("ERRO AO EDITAR PRODUTO:", erro);

        res.status(400).json({
            mensagem: "Erro ao editar produto.",
            erro: erro.message
        });
    }
});

// Excluir produto
app.delete("/api/produtos/:id", async (req, res) => {
    try {
        const produto = await Produto.findByIdAndDelete(req.params.id);

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        res.json({
            mensagem: "Produto excluído com sucesso!",
            produto
        });
    } catch (erro) {
        console.error("ERRO AO EXCLUIR PRODUTO:", erro);

        res.status(400).json({
            mensagem: "Erro ao excluir produto.",
            erro: erro.message
        });
    }
});

// ==============================
// RESERVAS
// ==============================

// Listar reservas
app.get("/api/reservas", async (req, res) => {
    try {
        const reservas = await Reserva.find().sort({ createdAt: -1 });

        res.json(reservas);
    } catch (erro) {
        console.error("ERRO AO BUSCAR RESERVAS:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar reservas.",
            erro: erro.message
        });
    }
});

// Criar reserva
app.post("/api/reservas", async (req, res) => {
    try {
        const reserva = await Reserva.create(req.body);

        res.status(201).json(reserva);
    } catch (erro) {
        console.error("ERRO AO CRIAR RESERVA:", erro);

        res.status(400).json({
            mensagem: "Erro ao criar reserva.",
            erro: erro.message
        });
    }
});

// Editar reserva
app.put("/api/reservas/:id", async (req, res) => {
    try {
        const reserva = await Reserva.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!reserva) {
            return res.status(404).json({
                mensagem: "Reserva não encontrada."
            });
        }

        res.json(reserva);
    } catch (erro) {
        console.error("ERRO AO EDITAR RESERVA:", erro);

        res.status(400).json({
            mensagem: "Erro ao editar reserva.",
            erro: erro.message
        });
    }
});

// Excluir reserva/pedido
app.delete("/api/reservas/:id", async (req, res) => {
    try {
        const reserva = await Reserva.findByIdAndDelete(req.params.id);

        if (!reserva) {
            return res.status(404).json({
                mensagem: "Reserva não encontrada."
            });
        }

        res.json({
            mensagem: "Pedido excluído com sucesso!",
            reserva
        });
    } catch (erro) {
        console.error("ERRO AO EXCLUIR RESERVA:", erro);

        res.status(400).json({
            mensagem: "Erro ao excluir pedido.",
            erro: erro.message
        });
    }
});

// ==============================
// AVALIAÇÕES
// ==============================

// Listar avaliações
app.get("/api/avaliacoes", async (req, res) => {
    try {
        const avaliacoes = await Avaliacao.find().sort({ createdAt: -1 });

        res.json(avaliacoes);
    } catch (erro) {
        console.error("ERRO AO BUSCAR AVALIAÇÕES:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar avaliações.",
            erro: erro.message
        });
    }
});

// Criar avaliação
app.post("/api/avaliacoes", async (req, res) => {
    try {
        const avaliacao = await Avaliacao.create(req.body);

        res.status(201).json(avaliacao);
    } catch (erro) {
        console.error("ERRO AO CRIAR AVALIAÇÃO:", erro);

        res.status(400).json({
            mensagem: "Erro ao criar avaliação.",
            erro: erro.message
        });
    }
});

// ==============================
// INICIAR SERVIDOR
// ==============================

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});