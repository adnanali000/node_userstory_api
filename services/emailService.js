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

const sendEmail = (to,subject,text) => {
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    }
    
    return transporter.sendMail(mailOptions)
}



module.exports = { sendEmail }