const mongoose = require('mongoose');


const connectDB = () => {
    mongoose.connect(process.env.DB).then(con => {
        console.log(`DataBase is connected with HOST: ${con.connection.host}`)
    })
}

module.exports = connectDB;