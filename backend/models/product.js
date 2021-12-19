const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxLength: [100, 'Product name can not exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        maxLength: [5, 'Price can not exceed 5 characters'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description']
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false,
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Electronics',
                'Cameras',
                'Laptops',
                'Headphones',
                'Accessories',
                'Books',
                'Chargers'
            ],
            message: 'Please select correct category for this product'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please provide product seller']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide product stock'],
        maxLength: [5, 'Product stock can not exceed 5 chars'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Product', productSchema);