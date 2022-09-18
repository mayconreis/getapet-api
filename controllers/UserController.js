const User = require('../models/User')
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')

// helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const createUserValidation = require('../helpers/create-user-validation')
const editUserValidation = require('../helpers/edit-user-validation')


module.exports = class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmpassword } = req.body

        const returnValidation = await createUserValidation(name, email, phone, password, confirmpassword)
        if (returnValidation) {
            res.status(422).json({ message: returnValidation })
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

        const id = req.params.id

        const { name, email, phone, password, confirmpassword } = req.body
        let image = ''

        if (req.file) {
            user.image = req.file.filename
        }

        const token = getToken(req)
        console.log(token)

        const user = await getUserByToken(token)
        console.log(user)

        const editValidation = await editUserValidation(token, user, name, email, phone, password, confirmpassword)
        if (editValidation) {
            res.status(422).json({ message: editValidation })
        }
        user.name = name
        user.email = email
        user.phone = phone

        if (password && password === confirmpassword) {
            // create a password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash
            return
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: user },
            { new: true }
        )
            .then(() => {
                res.status(200).json({ message: 'Usuário atualizado com sucesso!' })
            })
            .catch((error) => {
                res.status(500).json({ message: error })
            })

    }
}