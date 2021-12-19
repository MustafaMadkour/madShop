const Product = require('../models/product');
const dotenv = require('dotenv');
const connectDB = require('../config/database');

const products = require('../data/products.json');

dotenv.config({ path: 'backend/config/config.env' });

connectDB();

const seedProducts = async () => {
    try {
        // await Product.deleteMAny();
        // console.log('All products are deleted');

        await Product.insertMany(products);
        console.log('All Products are inserted');

        process.exit();

    } catch(error) {
        console.log(error.message);
        process.exit();
    }
}

seedProducts();