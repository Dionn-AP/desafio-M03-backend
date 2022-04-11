const verificarBodyCadastroUsuario = (usuario) => {
    const { nome, email, senha } = usuario;

    if(!nome) return "O nome é obrigatório."

    if(!email) return "O email é obrigatório."

    if(!senha) return "A senha é obrigatória."

    if(senha.length < 8) return "A senha precisa ter no mínimo 8 caracteres."
};

const verificarBodyLogin = (usuario) => {
    const { email, senha } = usuario;

    if(!email) return "O email é obrigatório."

    if(!senha) return "A senha é obrigatória."

    if(senha.length < 8) return "A senha precisa ter no mínimo 8 caracteres."
};

const verificarBodyTransacoes = (usuario) => {
    const { tipo, valor, categoria_id } = usuario;

    if(!valor) return "O campo valor é obrigatório."

    if(!categoria_id) return "O campo categoria é obrigatório."

    if(!tipo) return "O campo tipo é obrigatório."
};

module.exports = {
    verificarBodyCadastroUsuario,
    verificarBodyLogin,
    verificarBodyTransacoes
};