const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/inotes"

const connectToMongo = () => {
    mongoose.connect(mongoURI)
    console.log('Successfully connected');
}

module.exports = connectToMongo;