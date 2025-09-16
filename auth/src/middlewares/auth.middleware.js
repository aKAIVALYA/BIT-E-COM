const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');

async function authMiddleware(req,res,next){
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded

        req.user = user;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports={
    authMiddleware
}