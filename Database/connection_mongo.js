const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
    const database = await mongoose.connect(process.env.MONGODB_URI_RS, { 
        autoIndex: true ,
        retryWrites: false,
    })
    module.exports = { database };
})();

/*const database = mongoose.connection

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})*/

//module.exports = { database };
