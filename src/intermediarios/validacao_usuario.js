const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../chave_secreta/jwt_segredo');


const validacaoUsuarioLogado = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({"mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado."});
    }

    try {
        const token = authorization.replace('Bearer ', "").trim();
        
        const { id } = await jwt.verify(token, jwtSecret);
        const query = `select * from usuarios where id = $1`;

        const { rowCount, rows } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({mensagem: "Usuário não encontrado."})
        }

        const { senha, ...usuario } = rows[0];

        req.usuario = usuario;

        next();

    } catch {
        return res.status(400).json("O token é inválido.")
    }
};


module.exports = validacaoUsuarioLogado;