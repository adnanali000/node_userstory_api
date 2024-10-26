const User = require('../models/User')
const bcrypt = require('bcryptjs')
const Joi = require('joi')
const crypto = require('crypto');
const moment = require('moment');
const jwt = require('jsonwebtoken')
const {sendEmail} = require('../services/emailService')

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
        
        //generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
        user.verificationToken = verificationToken

        await user.save()

        //send verification email
        await sendEmail(email,'Verify your email address',`Please verify your email by clicking on the following link: ${verificationUrl}`)

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
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

//verify email
const verifyEmail = async(req,res)=>{
    const {token} = req.query
    try{
        const user = await User.findOne({verificationToken:token})
        if(!user){
            return res.status(400).json({message:'Invalid token'})
        }

        user.isVerified = true
        user.verificationToken = undefined
        await user.save()
        res.status(200).json({ message: 'Email verified successfully!' });
    }catch(error){
        res.status(500).json({ message: 'Server error' });
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

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
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

        const user = await User.findById(userId).select('-password')

        if(!user){
            return res.status(400).json({ message: 'User not found' });
        }

        //check if email is changing and if the email is verified
        if(email && email !== user.email && !user.isVerified){
            return res.status(403).json({ message: 'Please verify your email before changing it.' });
        }



        const updateUser = await User.findByIdAndUpdate(
            userId,
            {name,email},
            {new:true,runValidators:true}
        ).select('-password')

        if(!updateUser){
            return res.status(400).json({ message: 'User update failed' });
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

//reset password request
const requestResetPassword = async(req,res)=>{
    try{
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before requesting a password reset.' });
        }
    

        //create a reset token
        const resetToken = crypto.randomBytes(20).toString('hex')

        //reset password token and expiry time in user record
        user.resetToken = resetToken
        user.resetTokenExpiry = moment().add(1,'hour').toDate()
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`; // Update with your frontend URL

        await user.save()

        await sendEmail(email,'Password Reset', `You requested a password reset. Click the link to reset your password: ${resetUrl}`)

        res.status(200).json({ message: 'Reset token sent to email' });
    }
    catch(error){
        res.status(500).json({ message: 'Server error' });
    }
}

const resetPassword = async(req,res)=>{
    try{
        const {token,newPassword} = req.body
        const user = await User.findOne({
            resetToken:token,
            resetTokenExpiry:{$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({ message: 'Invalid or expired token' });
        }


        //hash the new password
        user.password = await bcrypt.hash(newPassword,10)
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        
        console.log(user)
        
        await user.save()

        res.status(200).json({ message: 'Password reset successfully' });
    }catch(error){
        console.log(error.message)
        res.status(500).json({ message: 'Server error' });

    }
}

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    requestResetPassword,
    resetPassword

}