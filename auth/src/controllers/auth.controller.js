const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const  redis = require('../db/redis');

async function registerUsers(req, res) {
    try {
        const { username, email, password, fullname, role } = req.body;
        if (!fullname || !fullname.firstName || !fullname.lastName) {
            return res.status(400).json({ message: 'Fullname with firstName and lastName is required' });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (isUserAlreadyExists) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash,
            fullname: { firstName: fullname.firstName, lastName: fullname.lastName },
            role: role || 'user'
        });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                role: user.role,
                addresses: user.addresses
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function loginUsers(req, res) {
    try {
        const {username, email, password } = req.body;
        const user = await userModel.findOne({ $or:[{email} , {username}] }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        })
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullName,
                role: user.role,
                addresses: user.addresses
            }
        });
        } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' }
        );
    }
}

async function getCurrentUser(req, res) {
   return res.status(200).json({ 
     message: 'Current user fetched successfully',
     user: req.user
    });
}

async function logoutUsers(req, res) {
     
    const token = req.cookies.token;

    if (!token) {
        await redis.set('blacklist:${token}','true','ex', 24*60*60);
    }

    return res.clearCookie('token',{
        httpOnly: true,
        secure: true,
    });

    return res.status(200).json({ message: 'Logout successful' });
}

async function getUserAddresses(req, res) {

    const id = req.user.id;
    const user = await userModel.findOne(id).select('addresses');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
        message: 'User addresses fetched successfully',
        addresses: user.addresses
    });



}

async function addUserAddress(req, res) {
    
    const id = req.user.id;

    const { street, city, state, pincode, country, isDefault } = req.body;

    const user = await userModel.findOneAndUpdate({ _id: id },{
        $push: {
            street,
            city,
            state,
            pincode,
            country,
            isDefault
        }
    }, { new: true })

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
        message: 'Address added successfully',
        addresses: user.addresses [user.addresses.length - 1]
    });

}

async function deleteUserAddress(req, res) {

    const id = req.user.id;
    const { addressId } = req.params;

    const isAddressExists = await userModel.findOne({ _id: id, 'addresses._id': addressId });

    if (!isAddressExists) {
        return res.status(404).json({ message: 'Address not found' });
    }

    const user = await userModel.findOneAndUpdate({ _id: id }, {
        $pull: { addresses: { _id: addressId } }
    } , { new: true });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const addressExists = user.addresses.some(address => address._id.toString() === addressId);

    return res.status(200).json({
        message: 'Address deleted successfully',
        addresses: user.addresses
    })


}


module.exports = {
    registerUsers,
    loginUsers,
    getCurrentUser,
    logoutUsers,
    getUserAddresses,
    addUserAddress,
    deleteUserAddress
}