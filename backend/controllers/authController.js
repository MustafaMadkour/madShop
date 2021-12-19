const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register new user => /api/v1/register
exports.registerUser = catchAsyncError( async (req, res, next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: '',
            url: ''
        }
    })

    sendToken(user, 200, res);
});

// Login User
exports.loginUser = catchAsyncError( async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email & password valid
    if (!email || !password) {
        return next(new ErrorHandler('Please ente a valid email & password', 400));
    }

    // Find user in database
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 200, res);
});

// Forgot Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncError( async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('This email is not found', 404));
    }
    
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset url is:\n\n${resetUrl}\n\nif you have not requested this email, then please ignore this`;

    try {

        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email is sent to: ${user.email}`
        })
        
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
})


// Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError( async(req, res, next) => {

    // Hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user) {
        return next(new ErrorHandler('Passwordreset token is invalid or has been expired', 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400));
    }

    // Setup a new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save password and sign token
    await user.save();
    sendToken(user, 200, res);
});


// Get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncError( async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});


// Update/Change Password => /api/v1/password/update
exports.updatePassword = catchAsyncError( async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if(!isMatched) {
        return next(new ErrorHandler('Old password is incorrect', 400))
    }

    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res);
});


// Update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncError( async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    // Avatar update: TODO

    const user = await USer.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    
    res.status(200).json({
        success: true
    });
});


// Logout user => /api/v1/logout
exports.logoutUser = catchAsyncError( async(req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
});

// Admin Routes
// Get all users => /api/v1/admin/users

exports.allUsers = catchAsyncError( async(req, res, next) => {
    
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
});

// Get user details => /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncError( async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User no found with id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user
    })
});

// Update user profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncError( async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };


    const user = await USer.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    
    res.status(200).json({
        success: true
    });
});


// Delete User => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError( async(req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 400))
    }

    // Remove Avatar from Cloudinary

    await user.remove();

    res.status(200).json({
        success: true
    })
});