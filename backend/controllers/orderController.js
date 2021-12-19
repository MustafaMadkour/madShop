const Oreder = require('../models/order');
const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncErrors');

// Create new Oreder => /api/v1/order/new
exports.newOrder = catchAsyncError( async(req, res, next) => {

    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        order
    })
});


// Get single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncError( async(req, res, next) => {

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorHandler('No order found with this ID', 404));
    }

    res.status(200).json({
        success: true,
        order
    })

});


// Get Logged in user orders => /api/v1/orders/me
exports.myOrders = catchAsyncError( async(req, res, next) => {

    const order = await Order.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        order
    })

});


// Get All Orderas by Admin => /api/v1/admin/orders
exports.getAllOrders = catchAsyncError( async(req, res, next) => {

    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
});



// Update process Order => /api/v1/admin/order/:id
exports.updateOrder = catchAsyncError( async(req, res, next) => {

    const order = await Order.findById(req.params.id);

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('You have already delivered this order', 400));
    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status
    order.deliveredAt = Date.now()

    await order.save()

    res.status(200).json({
        success: true
    })
});


// update stock
async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity

    await product.save({ validateBeforeSave: false });
};

// Delete Order => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncError( async(req, res, next) => {

    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler('No Order found with this ID', 400));
    }

    await order.remove();
    res.status(200).json({
        success: true
    })
});
