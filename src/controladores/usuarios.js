const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const jwtSecret = require('../chave_secreta/jwt_segredo');


const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if(!nome) { return res.status(400).json("O nome é obrigatório.") };
    if(!email) { return res.status(400).json("O email é obrigatório.") };
    if(!senha) { return res.status(400).json("A senha é obrigatória.") };
    if(senha.length < 8) { return res.status(400).json("A senha precisa ter no mínimo 8 caracteres.") };

    try {
        const query = `select * from usuarios where email = $1`;
        const usuario = await conexao.query(query, [email]);

        if (usuario.rowCount > 0) { return res.status(400).json("Este email ja foi cadastrado. Favor escolha outro email.") };

    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');

        const query = `insert into usuarios (nome, email, senha) 
        values ($1, $2, $3)`;
        
        const usuarioCadastrado = await conexao.query(query, [
            nome,  
            email, 
            hash
        ]);

        if (usuarioCadastrado.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastar o usuario');
        }

        const { rows: usuario } = await conexao.query(`
            select * from usuarios where email = $1`, [email]
        );

        return res.status(200).json({
            id: usuario[0].id,
            nome: usuario[0].nome,
            email: usuario[0].email
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};



module.exports ={
    cadastrarUsuario
};