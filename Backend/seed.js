const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Produto = require("./models/Produto");

dotenv.config();

const produtos = [
    {
        codigo: "002",
        nome: "Calça Jeans",
        categoria: "Vestuário adulto",
        tamanho: "40",
        estado: "Muito bom",
        status: "available",
        descricao: "Calça jeans clássica, resistente e versátil para o dia a dia.",
        troca: "🥫 3 alimentos não perecíveis"
    },

    {
        codigo: "003",
        nome: "Tênis Urbano",
        categoria: "Acessórios e calçados",
        tamanho: "38",
        estado: "Muito bom",
        status: "reserved",
        descricao: "Tênis urbano seminovo, confortável e pronto para novas caminhadas.",
        troca: "🧴 2 produtos de higiene pessoal"
    },

    {
        codigo: "004",
        nome: "Bolsa Caramelo",
        categoria: "Acessórios e calçados",
        tamanho: "Único",
        estado: "Ótimo estado",
        status: "available",
        descricao: "Bolsa funcional com acabamento clássico e amplo espaço interno.",
        troca: "🥫 2 alimentos não perecíveis"
    },

    {
        codigo: "005",
        nome: "Vestido Infantil",
        categoria: "Vestuário infantil",
        tamanho: "8 anos",
        estado: "Ótimo estado",
        status: "available",
        descricao: "Vestido infantil alegre e bem conservado para ganhar novas memórias.",
        troca: "🧴 2 produtos de higiene pessoal"
    },

    {
        codigo: "006",
        nome: "Sandália Bege",
        categoria: "Acessórios e calçados",
        tamanho: "36",
        estado: "Bom estado",
        status: "exchanged",
        descricao: "Sandália elegante que já encontrou uma nova história.",
        troca: "🥫 2 alimentos não perecíveis"
    }
];

async function cadastrarProdutos() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB conectado!");

        await Produto.insertMany(produtos);

        console.log("5 produtos cadastrados com sucesso!");

        await mongoose.disconnect();

        console.log("Conexão encerrada.");
    } catch (erro) {
        console.error("Erro ao cadastrar produtos:", erro);

        await mongoose.disconnect();
    }
}

cadastrarProdutos();