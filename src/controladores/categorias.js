const conexao = require('../conexao');


const listarCategoria = async (req, res) => {
    const { usuario } = req;

    const query = `select * from categorias`;

    try {
        const {rows: categorias} = await conexao.query(query);

        if(!categorias.length) {
            return res.status(404).json()
        }

        return res.status(200).json(categorias);

    } catch (error) {
        return res.status(500).json({"mensagem": "Falha na consulta. Não foi possivel listar as categorias."})
    }

    
};



module.exports ={
    listarCategoria
};