const User = require('../models/User')
const bcrypt = require('bcryptjs')
const Joi = require('joi')

//validation schema
const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email:Joi.string().email().required(),
    password:Joi.string().min(6).required()
})

const registerUser = async (req,res)=>{
    try{
        const {error} = registerSchema.validate(req.body)
        if(error){
            res.status(400).json({message:error.details[0].message})
        }

        const {name,email,password} = req.body
        
        //check if
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:'User already exists'})
        }

        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt);

        //create and save user
        const user = new User({name,email,password:hashPassword})
        await user.save()

        res.status(201).json({
            message: 'User registered successfully',
            user:{
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }
    catch(error){
        res.status(500).json({message:'Server error'})
    }
}

module.exports = {registerUser}