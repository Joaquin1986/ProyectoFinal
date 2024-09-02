const mongoose = require('mongoose');
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new Schema({
    title: {
        type: String,
        required: [true, "el nombre es obligatorio"]
    },
    description: {
        type: String,
        required: [true, "la descripción es obligatoria"]
    },
    price: {
        type: Number,
        required: [true, "el precio es obligatorio"]
    },
    thumbnails: { type: Array, default: [] },
    code: {
        type: String,
        unique: true,
        required: [true, "el codigo es obligatorio"],
        index: true
    },
    status: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        required: [true, "el stock es obligatorio"]
    },
    category: {
        type: String,
        required: [true, "la categoría es obligatoria"],
        index: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('product', productSchema);