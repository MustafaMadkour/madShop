const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTON") {
    let error = { ...err };
    error.message = err.message;

    // wrong mongoose object id error
    if(err.name === 'CastError') {
      const message = `Recource not found. Invalid: ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    // handling mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.values).map(value => value.message);
      error = new ErrorHandler(message, 400);
    }

    // Handling mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyvalue)} entered`;
      error = new ErrorHandler(message, 400);
    }

    // Handlin JWT error
    if (err.name === 'JsonWebTokenError') {
      const message = 'Json Web Token is Invalid, Please try again';
      error = new ErrorHandler(message, 400);
    }


    // Handlin Expired JWT error
    if (err.name === 'TokenExpiredError') {
      const message = 'Json Web Token is Expired, Please try again';
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
