const express = require('express');

const rota = express();

//ROTAS USUARIOS
rota.get('/usuario', );
rota.post('/login', );
rota.get('/usuario', );
rota.put('/usuario', );

//ROTAS TRANSAÇÕES
rota.get('/transacao', );
rota.get('/transacao/:id', );
rota.post('/transacao', );
rota.put('/transacao/:id', );
rota.delete('/transacao/:id', );

//ROTAS CATEGORIA
rota.get('/categoria', );


module.exports = rota;