const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    secure:true,
    host:'smtp.gmail.com',
    port:465,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendPasswordResetEmail = (to,resetToken) => {
    
    const resetUrl = `http://localhost:5000/api/users/reset-password?token=${resetToken}`; // Update with your frontend URL
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`
    }
    
    return transporter.sendMail(mailOptions)
}

module.exports = { sendPasswordResetEmail }