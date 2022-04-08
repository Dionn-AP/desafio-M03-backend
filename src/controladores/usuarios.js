const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const jwtSecret = require('../chave_secreta/jwt_segredo');
// const fs = require('fs/promises');


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


const listarPerfilUsuarios = async (req, res) => {
    const { usuario } = req;

    return res.status(200).json(usuario);

    // try {
        
    //     const { rows: usuarios } = await conexao.query(`select * from usuarios`);

    //     // for (const usuario of usuarios) {
    //     //     const { rows: emprestimos } = await conexao.query(
    //     //         `select e.id, e.usuario_id, e.livro_id, e.status, l.nome as livro from emprestimos e 
    //     //         left join livros l on e.livro_id = l.id 
    //     //         where usuario_id = $1`, 
    //     //         [usuario.id]
    //     //     );
            
    //     //     usuario.emprestimos = emprestimos;
    //     // }

        

    // } catch (error) {
    //     return res.status(400).json(error.message);
    // }
};


const atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, idade, email, telefone, cpf, senha } = req.body;

    try {
        const {rows: usuario} = await conexao.query('select * from usuarios where id = $1', [id]);
        
        if (!usuario.length) {
            return res.status(404).json('Usuario não encontrado.');
        }

        const query = `update usuarios set 
        nome = $1,
        email = $2,
        senha = $3
        where id = $4`;

        const usuarioAtualizado = await conexao.query(query, [
            !nome ? usuario[0].nome : nome,  
            !email ? usuario[0].email : email, 
            !senha ? usuario[0].senha : senha, 
            id
        ]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(400).json('Não foi possível atualizar o usuario');
        }

        return res.status(200).json('O usuario foi atualizado com sucesso');

    } catch (error) {
        return res.status(400).json(error.message);
    }
};


const login = async (req, res) => {
    const { email, senha } = req.body;

    if(!email) { return res.status(400).json("O email é obrigatório.") };
    
    if(!senha) { return res.status(400).json("A senha é obrigatória.") };

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
        }, jwtSecret, {expiresIn: '1h'});

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