const mongoose = require('mongoose');
const { Schema } = mongoose;

const productsInCartSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, ref: 'product',
        required: [true, "la identificación del producto es obligatoria"]
    },
    quantity: {
        type: Number,
        required: [true, "la cantidad del producto es obligatoria"]
    },
}, {
    _id: false
});

const cartSchema = new mongoose.Schema({
    products: {
        type: [productsInCartSchema],
        default: []
    }
}, {
    timestamps:
        true
}
);

cartSchema.pre('findOne', function () {
    this.populate('products.product');
});

cartSchema.pre('findById', function () {
    this.populate('products.product');
});

module.exports = mongoose.model('cart', cartSchema);