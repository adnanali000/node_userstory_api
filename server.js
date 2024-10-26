const express = require('express')
const app = express()
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')


const PORT = process.env.PORT || 5000

dotenv.config()
connectDB()

app.use(express.json())

//Routes
app.use('/api/users',userRoutes)    

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))