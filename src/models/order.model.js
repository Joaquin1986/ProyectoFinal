const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cart',
        required: [true, "identificación del carrito es obligatoria"],
        index: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, "el nombre es obligatorio"],
        index: true
    },
    address: {
        type: String,
        required: [true, "la dirección es obligatoria"]
    },
    email: {
        type: String,
        required: [true, "el email es obligatorio"]
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card']
    }
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);