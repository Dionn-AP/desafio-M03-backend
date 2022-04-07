const express = require('express');

const categorias  = require('./controladores/categorias');
const usuarios = require('./controladores/usuarios');

const rota = express();

//ROTAS USUARIOS
rota.get('/usuario', );
rota.post('/login', );
rota.post('/usuario', usuarios.cadastrarUsuario);
rota.put('/usuario', );

//ROTAS TRANSAÇÕES
rota.get('/transacao', );
rota.get('/transacao/:id', );
rota.post('/transacao', );
rota.put('/transacao/:id', );
rota.delete('/transacao/:id', );

//ROTAS CATEGORIA
rota.get('/categoria', categorias.listarCategoria);


module.exports = rota;