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

module.exports = {
    verificarBodyCadastroUsuario,
    verificarBodyLogin
};