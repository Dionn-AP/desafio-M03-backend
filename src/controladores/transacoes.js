const conexao = require('../conexao');


const listarTransacoes = async (req, res) => {
    const { usuario } = req;

    try {
        const query = 'select * from transacoes where usuario_id = $1';
        const { rows: transacoes } = await conexao.query(query, [usuario.id]);

        return res.status(200).json(transacoes);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const detalharTransacao = async (req, res) => {
    const { id: idTransacao } = req.params;
    const { usuario } = req;

    if (!idTransacao) {
        return res.status(404).json('O id deve ser informado');
    }

    try {
        const query = 'select * from transacoes where id = $1';
        const transacao = await conexao.query(query, [idTransacao]);

        if (transacao.rowCount === 0) {
            return res.status(404).json('transação inexistente');
        }

        if (transacao.rows[0].usuario_id !== usuario.id) {
            return res.status(404).json('transação inexistente');
        }

        return res.status(200).json(transacao.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarTransacao = async (req, res) => {
    const { tipo, descricao, valor, data, categoria_id } = req.body;
    const { usuario } = req;

    if (!valor) {
        return res.status(404).json('O campo valor é obrigatório')
    }
    if (!categoria_id) {
        return res.status(404).json('O campo categoria é obrigatório')
    }
    if (!tipo) {
        return res.status(404).json('O campo tipo é obrigatório')
    }

    try {
        const query = `
        insert into transacoes 
        (descricao, valor, data, categoria_id, usuario_id, tipo)
        values
        ($1, $2, $3, $4, $5, $6)
        `;

        const cadastroTransacao = await conexao.query(query, [descricao, valor, data, categoria_id, usuario.id, tipo]);

        if (cadastroTransacao.rowCount === 0) {
            return res.status(400).json('Não foi possível cadastrar a transação');
        }

        return res.status(200).json('Transação cadastrada com sucesso');

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarTransacao = async (req, res) => {
    const { tipo, descricao, valor, data, categoria_id } = req.body;
    const { usuario } = req;
    const { id: idTransacao } = req.params;

    if (!valor) {
        return res.status(404).json('O campo valor é obrigatório')
    }
    if (!categoria_id) {
        return res.status(404).json('O campo categoria é obrigatório')
    }
    if (!tipo) {
        return res.status(404).json('O campo tipo é obrigatório')
    }

    try {

        const transacaoAlterada = await conexao.query('select * from transacoes where id = $1', [idTransacao]);

        if (transacaoAlterada.rows[0].usuario_id !== usuario.id) {
            return res.status(404).json('transação inexistente');
        }

        const query = `
        update transacoes set 
        descricao = $1, valor = $2, data = $3, categoria_id = $4, usuario_id = $5, tipo = $6
        where id = $7
        `;

        const atualizarTransacao = await conexao.query(query, [descricao, valor, data, categoria_id, usuario.id, tipo, idTransacao]);

        if (atualizarTransacao.rowCount === 0) {
            return res.status(400).json('Não foi possível atualizar a transação');
        }

        return res.status(200).json('Transação atualizada com sucesso');

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirTransacao = async (req, res) => {
    const { id: idTransacao } = req.params;
    const { usuario } = req;

    try {

        const query = 'select * from transacoes where id = $1';
        const econtrarTransacao = await conexao.query(query, [idTransacao]);

        if (econtrarTransacao.rowCount === 0) {
            return res.status(404).json('transação inexistente');
        }

        if (econtrarTransacao.rows[0].usuario_id !== usuario.id) {
            return res.status(404).json('transação inexistente');
        }

        const queryDelete = 'delete from transacoes where id = $1';
        const deletar = await conexao.query(queryDelete, [idTransacao]);

        return res.status(200).json('Transação deletada com sucesso');

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
            return res.status(200).json('Não existem transacoes');
        }

        let saida = 0;
        for (const transacao of transacoes) {
            if (transacao.tipo === 'saida') {
                saida = saida + transacao.valor;
            }
        }

        let entrada = 0;
        for (const transacao of transacoes) {
            if (transacao.tipo === 'entrada') {
                entrada = entrada + transacao.valor;
            }
        }

        const extrato = {
            entrada: entrada,
            saida: saida
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