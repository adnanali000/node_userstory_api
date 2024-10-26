const User = require('../models/User')
const bcrypt = require('bcryptjs')
const Joi = require('joi')
const jwt = require('jsonwebtoken')

//validation schema
const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email:Joi.string().email().required(),
    password:Joi.string().min(6).required()
})

//register user
const registerUser = async (req,res)=>{
    try{
        const {error} = registerSchema.validate(req.body)
        if(error){
          return res.status(400).json({message:error.details[0].message})
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

//login user
const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body
        if(!email || !password){
            return res.status(400).json({message:'Email and password are required'})
        }

        //check if user exits
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:'Invalid credentials'})
        }

        //compare password
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'})
        }

        //Generate JWT token
        const token = jwt.sign({id:user._id,isAdmin:user.isAdmin},process.env.JWT_SECRET,{expiresIn:'1h'})

        res.status(200).json({
            message:'Login successful',
            token,
            user: {
                id:user._id,
                name:user.name,
                email:user.email
            }
        })

    }catch(error){
        res.status(500).json({message:'Server error'})
    }
}

//get user profile
const getUserProfile = async(req,res)=>{
    try{
        //get user id from jwt token
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
        if(!token){
            return res.status(401).json({message: 'No token provided'})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const userId = decoded.id

        //find user by id & exclude password from it
        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(400).json({message:'User not found'})
        }

        res.status(200).json({
            message:'User profile retrieved successfully',
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        })

    }catch(error){
        res.status(500).json({message:'Server error'})

    }
}

//update user profile
const updateUserProfile = async(req,res)=>{
    try{
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(401).json({message: 'No token provided'})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const userId = decoded.id

        const {name,email} = req.body

        const updateUser = await User.findByIdAndUpdate(
            userId,
            {name,email},
            {new:true,runValidators:true}
        ).select('-password')

        if(!updateUser){
            return res.status(400).json({message:'User not found'})
        }

        res.status(200).json({
            message:'User updated successfully',
            user:{
                id:updateUser._id,
                name:updateUser.name,
                email:updateUser.email
            }
        })

    }catch(error){
        res.status(500).json({ message: 'Server error' });
    }
}

//delete user
const deleteUser = async(req,res)=>{
    try{
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const deleteUser = await User.findByIdAndDelete(userId)
        if(!deleteUser){
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });

    }catch(error){
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {registerUser,loginUser,getUserProfile,updateUserProfile,deleteUser}