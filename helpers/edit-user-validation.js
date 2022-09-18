const User = require('../models/User')

const editUserValidation = async (token, user, name, email, phone, password, confirmpassword) => {
    let message = ''

    // validations
    if (!name) {
        message = 'O nome é obrigatorio'
        return message
    }

    if (!email) {
        message = 'O email é obrigatorio'
        return message
    }

    const userExists = await User.findOne({ email: email })
        .catch((error) => {
            console.log(error)
        })

    if (user.email !== email && userExists) {
        message = 'Usuário já possui cadastro no sistema'
        return message
    }

    if (!phone) {
        message = 'O telefone é obrigatorio'
        return message
    }

    if (password !== confirmpassword) {
        message = 'As senhas não são iguais'
        return message
    } 
}

module.exports = editUserValidation