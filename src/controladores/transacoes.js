const conexao = require('../conexao');
const { verificarBodyTransacoes } = require('../funcoes_verificacao/verificar_requisicao_body');


const listarTransacoes = async (req, res) => {
    const { usuario } = req;

    try {
        const query = 'select * from transacoes where usuario_id = $1';
        const { rows: transacoes } = await conexao.query(query, [usuario.id]);
        

        for (const transacao of transacoes) {
            const { rows: nomeCategoria } = await conexao.query(
                    `select nome from categorias where id = $1`, 
                    [transacao.categoria_id]
                );
          
            transacao.categoria_nome = nomeCategoria[0].nome;
        }

        return res.status(200).json(transacoes);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const detalharTransacao = async (req, res) => {
    const { id: idTransacao } = req.params;
    const { usuario } = req;

    try {
        const query = 'select * from transacoes where id = $1 and usuario_id = $2';
        const transacao = await conexao.query(query, [idTransacao, usuario.id]);

        if (transacao.rowCount === 0) {
            return res.status(404).json({"mensagem": "Transação inexistente."});
        }

        if (transacao.rows[0].usuario_id !== usuario.id) {
            return res.status(404).json({"mensagem": "Transação inexistente."});
        }

        const { rows: nomeCategoria } = await conexao.query(
            `select nome from categorias where id = $1`, 
            [transacao.rows[0].categoria_id]
        );

        transacao.rows[0].categoria_nome = nomeCategoria[0].nome;

        return res.status(200).json(transacao.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarTransacao = async (req, res) => {
    const { tipo, descricao, valor, data, categoria_id } = req.body;
    const { usuario } = req;

    const erro = verificarBodyTransacoes(req.body);
    
    if (erro) { return res.status(400).json({"mensagem": erro}) };

    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({"mensagem": "O tipo de transação especificado é inválido."});
    }

    try {
        const query = `
        insert into transacoes 
        (descricao, valor, data, categoria_id, usuario_id, tipo)
        values
        ($1, $2, $3, $4, $5, $6)
        `;

        const queryCategoria = `select * from categorias where id = $1`;

        const categoriaEncontrada = await conexao.query(queryCategoria, [categoria_id]);

        if (categoriaEncontrada.rowCount === 0) {
            return res.status(400).json({"mensagem": "Não existe categoria para o Id informado."});
        }

        const cadastroTransacao = await conexao.query(query, [descricao, valor, data, categoria_id, usuario.id, tipo]);
        
        const { rows: transacaoEncontrada } = await conexao.query(`select * from transacoes where usuario_id = $1`, [usuario.id]);

        if (cadastroTransacao.rowCount === 0) {
            return res.status(400).json({"mensagem": "Não foi possível cadastrar a transação."});
        }

        return res.status(200).json({
            id: transacaoEncontrada[transacaoEncontrada.length - 1].id,
            tipo,
            descricao,
            valor,
            data,
            usuario_id: usuario.id,
            categoria_id,
            categoria_nome: categoriaEncontrada.rows[0].nome,
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarTransacao = async (req, res) => {
    const { tipo, descricao, valor, data, categoria_id } = req.body;
    const { usuario } = req;
    const { id: idTransacao } = req.params;

    const erro = verificarBodyTransacoes(req.body);
    
    if (erro) { return res.status(400).json({"mensagem": erro}) };

    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({"mensagem": "O tipo de transação especificado é inválido."});
    }

    try {

        const transacaoEncontrada = await conexao.query('select * from transacoes where id = $1', [idTransacao]);

        if (transacaoEncontrada.rowCount === 0) {
            return res.status(404).json({"mensagem": "transação inexistente."});
        }

        if (transacaoEncontrada.rows[0].usuario_id !== usuario.id) {
            return res.status(404).json({"mensagem": "Você só pode atualizar suas próprias transações."});
        }

        const existeCategoria = await conexao.query(
            `select * from categorias where id = $1`, 
            [categoria_id]
        );

        if (existeCategoria.rowCount === 0) {
            return res.status(404).json({"mensagem": "Categoria da transação inexistente."});
        }

        const query = `
        update transacoes set 
        descricao = $1, valor = $2, data = $3, categoria_id = $4, usuario_id = $5, tipo = $6
        where id = $7
        `;

        const atualizarTransacao = await conexao.query(query, [descricao, valor, data, categoria_id, usuario.id, tipo, idTransacao]);

        if (atualizarTransacao.rowCount === 0) {
            return res.status(400).json({"mensagem": "Não foi possível atualizar a transação."});
        }

        return res.send(200);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirTransacao = async (req, res) => {
    const { id: idTransacao } = req.params;
    const { usuario } = req;

    try {

        const query = 'select * from transacoes where id = $1';
        const encontrarTransacao = await conexao.query(query, [idTransacao]);

        if (encontrarTransacao.rowCount === 0) {
            return res.status(404).json({"mensagem": "transação inexistente."});
        }

        if (encontrarTransacao.rows[0].usuario_id !== usuario.id) {
            return res.status(404).json({"mensagem": "transação inexistente."});
        }

        const queryDelete = 'delete from transacoes where id = $1';
        await conexao.query(queryDelete, [idTransacao]);

        return res.send(204);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterExtrato = async (req, res) => {
    const { usuario } = req;

    try {
        const query = 'select * from transacoes where usuario_id = $1';
        const { rows: transacoes, rowCount } = await conexao.query(query, [usuario.id]);

        if (rowCount === 0) {
            return res.status(200).json({"mensagem": "Não existem transacoes."});
        }

        let saida = 0;
        for (const transacao of transacoes) {
            if (transacao.tipo === 'saida') {
                saida += transacao.valor;
            }
        }

        let entrada = 0;
        for (const transacao of transacoes) {
            if (transacao.tipo === 'entrada') {
                entrada += transacao.valor;
            }
        }

        const extrato = {
            entrada,
            saida
        }

        return res.status(200).json(extrato);

    } catch (error) {
        return res.status(400).json(error.message);
    }

}

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    excluirTransacao,
    obterExtrato
}