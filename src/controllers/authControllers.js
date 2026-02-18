const authService = require('../services/authService');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const newUser = await authService.registerUser(email, password);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }

}
const login = async (req, res) => {
    
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);
        const token = generateToken(user);
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: user,
            token: token
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = { register, login};