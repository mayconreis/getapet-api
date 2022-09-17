const User = require('../models/User')
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')

// helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')

module.exports = class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmpassword } = req.body

        // validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatorio' })
            return
        }
        if (!email) {
            res.status(422).json({ message: 'O email é obrigatorio' })
            return
        }
        if (!phone) {
            res.status(422).json({ message: 'O telefone é obrigatorio' })
            return
        }
        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatoria' })
            return
        }
        if (!confirmpassword) {
            res.status(422).json({ message: 'A confirmação de senha é obrigatoria' })
            return
        }

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'As senhas não são iguais' })
            return
        }

        //check if user exists
        const userExists = await User.findOne({ email: email })
        if (userExists) {
            res.status(422).json({ message: 'Usuário já possui cadastro no sistema' })
            return
        }

        // create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // create a user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })

        const newUser = await user.save()
            .then((newUser) => {
                createUserToken(newUser, req, res)
            })
            .catch((error) => {
                res.status(500).json({ message: error })
            })
    }

    static async login(req, res) {
        const { email, password } = req.body

        if (!email) {
            res.status(422).json({ message: 'O email é obrigatorio' })
            return
        }
        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatoria' })
            return
        }

        //check if user exists
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(422).json({ message: 'Usuário ou senha inválidos' })
        }

        // check if password match
        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) {
            res.status(422).json({ message: 'Usuário ou senha inválidos' })
            return
        }

        await createUserToken(user, req, res)
    }

    static async checkUser(req, res) {
        let currentUser

        if (req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            currentUser = await User.findById(decoded.id).select('-password')

        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        const id = req.params.id

        const user = await User.findById(id).select('-password')

        if (!user) {
            res.status(422).json({ message: 'Usuário não encontrado' })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req, res) {
        res.status(200).json({ message: "Editado com sucesso" })
    }
}