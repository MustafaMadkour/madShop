const express = require('express');
const router = express.Router();

const { 
    getProducts, 
    newProduct, 
    getProduct, 
    updateProduct, 
    deleteProduct, 
    createProductReview, 
    getProductReviews, 
    deleteReview
} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/products').get(getProducts);
router.route('/admin/products/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/product/:id').get(getProduct);
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/review').get(isAuthenticatedUser, getProductReviews);
router.route('/review').delete(isAuthenticatedUser, deleteReview);

module.exports = router;