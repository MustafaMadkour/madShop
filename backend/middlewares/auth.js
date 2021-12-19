const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('./catchAsyncErrors');

// Check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncError( async(req, res, next) => {

    const { token } = req.cookies;

    if(!token) {
        return next(new ErrorHandler('Please register or login first', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
});

// Handling user roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user.role}) can not access this resource`, 403));
        }
        next();
    }
}