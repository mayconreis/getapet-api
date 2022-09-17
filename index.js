const express = require('express')
const cors = require('cors')

const app = express()
const port = 5000

// Config JSON resposnse
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin: "localhost:27017" }))

// Public folder for images
app.use(express.static('public'))

// Routes
const PetsRoutes = require('./routes/PetsRoutes')
const UserRoutes = require('./routes/UserRoutes')

app.use('/users', UserRoutes)
app.use('/pets', PetsRoutes)

app.listen(port, () => console.log(`App rodando na porta ${port}!`))