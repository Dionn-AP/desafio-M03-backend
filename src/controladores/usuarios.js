const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const jwtSecret = require('../chave_secreta/jwt_segredo');

const { verificarBodyCadastroUsuario, verificarBodyLogin } 
= require('../funcoes_verificacao/verificar_requisicao_body');


const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    const erro = verificarBodyCadastroUsuario(req.body);
    
    if (erro) { return res.status(400).json({"mensagem": erro}) };

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

        const queryUsuario = `select * from usuarios where email = $1`;
        const {rows: usuarioEncontrado} = await conexao.query(queryUsuario, [email]);

        if (usuarioCadastrado.rowCount === 0) {
            return res.status(400).json({"mensagem": "Não foi possivel cadastar o usuario"});
        }

        return res.status(201).json({
            id: usuarioEncontrado[0].id,
            nome: usuarioEncontrado[0].nome,
            email: usuarioEncontrado[0].email
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};


const listarPerfilUsuarios = async (req, res) => {
    const { usuario } = req;

    try {
        
        const { rows: perfilUsuarios } = await conexao.query(`select * from usuarios where id = $1`, [usuario.id]);

        return res.status(200).json({
            "id": perfilUsuarios[0].id,
            "nome": perfilUsuarios[0].nome,
            "email": perfilUsuarios[0].email
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};


const atualizarUsuario = async (req, res) => {
    const { usuario } = req;
    const { nome, email, senha } = req.body;

    const erro = verificarBodyCadastroUsuario(req.body);
    
    if (erro) { return res.status(400).json({"mensagem": erro}) };

    try {

        const queryEmail = `select * from usuarios where email = $1`;
        
        const usuarioEmailExistente = await conexao.query(queryEmail, [email]);
        
        if (usuarioEmailExistente.rowCount > 0) { 
            if (usuarioEmailExistente.rows[0].id !== usuario.id) {
                return res.status(400).json({
                    "mensagem": "O e-mail informado já está sendo utilizado por outro usuário."
                })
            }
        };

    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {

        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');

        const query = `update usuarios set 
        nome = $1,
        email = $2,
        senha = $3
        where id = $4`;

        const usuarioAtualizado = await conexao.query(query, [
            nome, 
            email, 
            hash,
            usuario.id
        ]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(400).json({"mensagem": "Não foi possível atualizar o usuario."});
        }

        return res.send(204);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};


const login = async (req, res) => {
    const { email, senha } = req.body;

    const erro = verificarBodyLogin(req.body);
    
    if (erro) { return res.status(400).json({"mensagem": erro}) };

    try {
        const query = `select * from usuarios where email = $1`;
        const usuarios = await conexao.query(query, [email]);

        if (usuarios.rowCount === 0) { return res.status(400).json("O email ou senha incorretos.") };

        const usuario = usuarios.rows[0];

        const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, 'hex'));
  
        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json("A senha está incorreta.");
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {

                    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');

                    const query = `update usuarios set senha = $1 where email = $2`;
                    
                    await conexao.query(query, [hash, email]);
                    
                } catch {
                }
            break;
        }

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }, jwtSecret, {expiresIn: '3h'});

        return res.status(200).json({ 
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }, 
            token
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};



module.exports ={
    cadastrarUsuario,
    login,
    listarPerfilUsuarios,
    atualizarUsuario
};