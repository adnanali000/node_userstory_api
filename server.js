const express = require('express')
const app = express()
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const PORT = process.env.PORT || 5000

dotenv.config()
connectDB()

app.use(express.json())


app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))