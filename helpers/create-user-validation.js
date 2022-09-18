const User = require('../models/User')
const createUserValidation = async (name, email, phone, password, confirmpassword) => {
    // validations
    let message = ''
    if (!name) {
        message = 'O nome é obrigatorio'
        return message
    }
    if (!email) {
        message = 'O email é obrigatorio'
        return message
    }
    if (!phone) {
        message = 'O telefone é obrigatorio'
        return message
    }
    if (!password) {
        message = 'A senha é obrigatoria' 
        return message
    }
    if (!confirmpassword) {
        message = 'A confirmação de senha é obrigatoria'
        return message
    }

    if (password !== confirmpassword) {
        message = 'As senhas não são iguais'
        return message
    }

    if(password.length < 9){
        message = 'A senha deve ter no mínimo 8 caracteres'
        return message
    }

    //check if user exists
    const userExists = await User.findOne({ email: email })
    if (userExists) {
        message = 'Usuário já possui cadastro no sistema'
        return message
    }
}

module.exports = createUserValidation