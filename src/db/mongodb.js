const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.URI);
        mongoose.set('autoIndex', false);
        console.log('✅ La APP se conectó exitosamente con MongoDB!');
    } catch (error) {
        console.error('⛔ Error: No se pudo conectar con MongoDB -> ' + error);
        process.exit();
    }
};

module.exports = connectMongoDB;