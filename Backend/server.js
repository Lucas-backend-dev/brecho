const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const dotenv = require("dotenv");

const multer = require("multer");

const sharp = require("sharp");

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
// MULTER
// ==============================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!tiposPermitidos.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Formato de imagem não permitido. Use JPG, PNG, WEBP ou GIF."
                )
            );
        }

        cb(null, true);
    }
});

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

// ==============================
// FUNÇÃO PARA FORMATAR PRODUTO
// ==============================

function formatarProduto(produto) {
    const produtoObj = produto.toObject();

    // Não enviar o Buffer da imagem na resposta JSON
    delete produtoObj.imagem;

    delete produtoObj.imagemContentType;

    // URL para o navegador buscar a imagem
    produtoObj.imagem = `/api/produtos/${produto._id}/imagem`;

    return produtoObj;
}

// ==============================
// LISTAR PRODUTOS
// ==============================

app.get("/api/produtos", async (req, res) => {
    try {
        const produtos = await Produto.find()
            .select("-imagem -imagemContentType")
            .sort({ createdAt: -1 });

        const produtosFormatados = produtos.map((produto) => {
            const produtoObj = produto.toObject();

            produtoObj.imagem = `/api/produtos/${produto._id}/imagem`;

            return produtoObj;
        });

        res.json(produtosFormatados);
    } catch (erro) {
        console.error("ERRO AO BUSCAR PRODUTOS:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar produtos.",
            erro: erro.message
        });
    }
});

// ==============================
// EXIBIR IMAGEM DO PRODUTO
// ==============================

app.get("/api/produtos/:id/imagem", async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id)
            .select("imagem imagemContentType");

        if (!produto || !produto.imagem) {
            return res.status(404).json({
                mensagem: "Imagem do produto não encontrada."
            });
        }

        res.set("Content-Type", produto.imagemContentType);

        res.set("Cache-Control", "public, max-age=86400");

        res.send(produto.imagem);
    } catch (erro) {
        console.error("ERRO AO BUSCAR IMAGEM:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar imagem.",
            erro: erro.message
        });
    }
});

// ==============================
// CRIAR PRODUTO
// ==============================

app.post(
    "/api/produtos",
    upload.single("imagem"),
    async (req, res) => {
        try {
            // ==============================
            // VERIFICAR IMAGEM
            // ==============================

            if (!req.file) {
                return res.status(400).json({
                    mensagem: "A imagem do produto é obrigatória."
                });
            }

            // ==============================
            // PROCESSAR IMAGEM COM SHARP
            // ==============================

            const imagemProcessada = await sharp(req.file.buffer)
                .resize(1200, 1200, {
                    fit: "inside",
                    withoutEnlargement: true
                })
                .webp({
                    quality: 82
                })
                .toBuffer();

            // ==============================
            // VERIFICAR TAMANHO FINAL
            // ==============================

            if (imagemProcessada.length > 12 * 1024 * 1024) {
                return res.status(400).json({
                    mensagem:
                        "A imagem processada ficou muito grande para ser armazenada no MongoDB."
                });
            }

            // ==============================
            // CRIAR PRODUTO
            // ==============================

            const produto = await Produto.create({
                ...req.body,

                // A imagem vai DIRETAMENTE para o MongoDB
                imagem: imagemProcessada,

                imagemContentType: "image/webp",

                imagemPublicId: ""
            });

            // ==============================
            // RESPOSTA
            // ==============================

            res.status(201).json(formatarProduto(produto));
        } catch (erro) {
            console.error("ERRO AO CRIAR PRODUTO:", erro);

            res.status(400).json({
                mensagem: "Erro ao criar produto.",
                erro: erro.message
            });
        }
    }
);

// ==============================
// EDITAR PRODUTO
// ==============================

app.put(
    "/api/produtos/:id",
    upload.single("imagem"),
    async (req, res) => {
        try {
            const produto = await Produto.findById(req.params.id);

            if (!produto) {
                return res.status(404).json({
                    mensagem: "Produto não encontrado."
                });
            }

            // ==============================
            // ATUALIZAR DADOS DO PRODUTO
            // ==============================

            const camposPermitidos = [
                "codigo",
                "nome",
                "categoria",
                "tamanho",
                "estado",
                "status",
                "descricao",
                "troca"
            ];

            camposPermitidos.forEach((campo) => {
                if (req.body[campo] !== undefined) {
                    produto[campo] = req.body[campo];
                }
            });

            // ==============================
            // SE NOVA IMAGEM FOI ENVIADA
            // ==============================

            if (req.file) {
                const imagemProcessada = await sharp(req.file.buffer)
                    .resize(1200, 1200, {
                        fit: "inside",
                        withoutEnlargement: true
                    })
                    .webp({
                        quality: 82
                    })
                    .toBuffer();

                if (imagemProcessada.length > 12 * 1024 * 1024) {
                    return res.status(400).json({
                        mensagem:
                            "A imagem processada ficou muito grande para ser armazenada no MongoDB."
                    });
                }

                produto.imagem = imagemProcessada;

                produto.imagemContentType = "image/webp";
            }

            await produto.save();

            res.json(formatarProduto(produto));
        } catch (erro) {
            console.error("ERRO AO EDITAR PRODUTO:", erro);

            res.status(400).json({
                mensagem: "Erro ao editar produto.",
                erro: erro.message
            });
        }
    }
);

// ==============================
// EXCLUIR PRODUTO
// ==============================

app.delete("/api/produtos/:id", async (req, res) => {
    try {
        const produto = await Produto.findByIdAndDelete(req.params.id);

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        // A imagem está dentro do próprio documento MongoDB.
        // Portanto, ao excluir o produto, a imagem também é excluída.

        res.json({
            mensagem: "Produto excluído com sucesso!",
            produto: formatarProduto(produto)
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
// TRATAMENTO DE ERROS DO MULTER
// ==============================

app.use((erro, req, res, next) => {
    if (erro instanceof multer.MulterError) {
        if (erro.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                mensagem: "A imagem não pode ter mais de 10 MB."
            });
        }

        return res.status(400).json({
            mensagem: "Erro no upload da imagem.",
            erro: erro.message
        });
    }

    // Erro de formato de arquivo
    if (
        erro.message &&
        erro.message.includes("Formato de imagem não permitido")
    ) {
        return res.status(400).json({
            mensagem: erro.message
        });
    }

    next(erro);
});

// ==============================
// TRATAMENTO GERAL DE ERROS
// ==============================

app.use((erro, req, res, next) => {
    console.error("ERRO INTERNO DO SERVIDOR:", erro);

    res.status(500).json({
        mensagem: "Erro interno do servidor."
    });
});

// ==============================
// INICIAR SERVIDOR
// ==============================

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});