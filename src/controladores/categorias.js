const conexao = require('../conexao');


const listarCategoria = async (req, res) => {
    const { usuario } = req;

    try {
        const query = `
        select distinct c.id, c.descricao from categorias c 
        inner join transacoes t on c.id = t.categoria_id 
        where t.usuario_id = $1
        `;

        const categorias = await conexao.query(query, [usuario.id]);

        return res.status(200).json(categorias.rows);

    } catch (error) {
        return res.status(500).json({
            "mensagem": "Falha na consulta. Não foi possivel listar as categorias."
        });
    }

    
};



module.exports ={
    listarCategoria
};