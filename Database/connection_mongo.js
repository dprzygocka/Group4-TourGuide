const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_ATLAS, { autoIndex: true });

const database = mongoose.connection

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

module.exports = { database };
