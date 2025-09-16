const {body, validationResult} = require('express-validator');

const respondValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

const registerUserValidations =[
    body('username')
    .isString()
    .isLength({min:3})
    .withMessage('Username must be at least 3 characters long'),

    body('email')
    .isEmail()
    .withMessage('Invalid email address'),

    body('password')
    .isLength({min:6})
    .withMessage('Password must be at least 6 characters long'),

    body('fullName.firstName')
    .isString()
    .notEmpty()
    .withMessage('First name is required'),

    body('role')
    .optional()
    .isIn(['user', 'seller'])
    .withMessage('Role must be either user or seller'),

    respondValidationErrors
]

const loginUserValidations = [
 body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
 body('username')
    .optional()
    .isString()
    .withMessage('username must be a string'),
 body('password')
    .isLength({min:6})
    .withMessage('Password is required'),

    (req, res, next) => {
    if (!req.body.email && !req.body.username) {
        return res.status(400).json({errers : [{msg: "Either email or username is required"}]});
    }
    respondValidationErrors(req, res, next);
}

    
]

const addUserAddressValidations = [
    body('street')
    .isString()
    .withMessage('Street is required')
    .notEmpty()
    .withMessage('Street cannot be empty'),
    body('city')
    .isString()
    .withMessage('City is required')
    .notEmpty()
    .withMessage('City cannot be empty'),
    body('state')
    .isString()
    .withMessage('State is required')
    .notEmpty()
    .withMessage('State cannot be empty'),
    body('pinCode')
    .isString()
    .withMessage('Zip code is required')
    .notEmpty()
    .withMessage('Zip code cannot be empty'),
    body('country')
    .isString()
    .withMessage('Country is required')
    .notEmpty()
    .withMessage('Country cannot be empty'),
    body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),


]

module.exports = {
    registerUserValidations,
    loginUserValidations,
    addUserAddressValidations
};