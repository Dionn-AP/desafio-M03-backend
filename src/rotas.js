const express = require('express');

const categorias  = require('./controladores/categorias');
const usuarios = require('./controladores/usuarios');
const validarLogin = require('./intermediarios/validacao_usuario');

const rota = express();

//ROTAS USUARIOS
rota.post('/usuario', usuarios.cadastrarUsuario);
rota.post('/login', usuarios.login);

//AS ROTAS A PARTIR DESSE PONTO SERÃO VALIDADAS PELO MIDDLEWARE
rota.use(validarLogin);

rota.get('/usuario', usuarios.listarPerfilUsuarios);
rota.put('/usuario/', usuarios.atualizarUsuario);


//ROTAS TRANSAÇÕES
rota.get('/transacao', );
rota.get('/transacao/:id', );
rota.post('/transacao', );
rota.put('/transacao/:id', );
rota.delete('/transacao/:id', );


//ROTAS CATEGORIA
rota.get('/categoria', categorias.listarCategoria);


module.exports = rota;