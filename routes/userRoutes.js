const express = require('express')
const {registerUser,loginUser,getUserProfile,resetPassword,requestResetPassword,updateUserProfile,deleteUser} = require('../controllers/userController')
const {authMiddleware} = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/profile',authMiddleware,getUserProfile)
router.put('/profile',authMiddleware,updateUserProfile)
router.delete('/profile',authMiddleware,deleteUser)
router.post('/forget-password',requestResetPassword)
router.post('/reset-password',resetPassword)

module.exports = router;