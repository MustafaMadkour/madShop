const app = require('./app');
const connectDB = require('./config/database');

const dotenv = require('dotenv');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception');
    process.exit(1);
});

// Setting up config file 
dotenv.config({ path: 'backend/config/config.env' });

// Connecting to DataBase
connectDB();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle Promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down the server due to unhandled rejection`);
    server.close(() => {
        process.exit(1);
    });
});