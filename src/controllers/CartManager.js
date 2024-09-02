const mongoose = require('mongoose');
const cartModel = require('../models/cart.model.js');
const { ProductManager } = require('./ProductManager.js');

// Clase Cart, con su correspondiente contructor las props definidas en la consigna
class Cart {
    constructor() {
        this.products = [];
    }
}

// Clase CartManager con su constructor tal como se solicitó, con un array 'products' vacío
class CartManager {

    // Devuelve el carrito como objeto plano, de acuerdo al id proporcionado por argumento
    static async getCartById(id) {
        try {
            if (mongoose.isValidObjectId(id)) {
                return await cartModel.findById(id).lean();
            }
            return undefined;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el carrito con id#${id} => error: ${error.message}`)
        }
    }

    // Devuelve el carrito como un documento MongoDB
    static async getPopulatedCartById(id) {
        try {
            if (mongoose.isValidObjectId(id)) {
                return await cartModel.findOne({ _id: id });
            }
            return undefined;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el carrito con id#${id} => error: ${error.message}`)
        }
    }

    // Agrega un producto a la BD
    static async addCart(cart) {
        try {
            const newCart = await cartModel.create(cart);
            console.log(`✅ Carrito '${newCart._id}' agregado exitosamente`);
            return newCart._id;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo crear el carrito en la BD => error: ${error.message}`);
        }
    }

    // Agrega una cantidad de cierto producto (productId) a determinado carrito (cartId)
    static async addProductToCart(cartId, productId, quantity) {
        quantity = parseInt(quantity);
        try {
            if (mongoose.isValidObjectId(cartId) || mongoose.isValidObjectId(productId) || quantity) {
                const cartExists = await this.getCartById(cartId);
                const productExists = await ProductManager.getProductById(productId);
                if (cartExists && productExists && productExists.status) {
                    const cart = await cartModel.findOne({ _id: cartId });
                    let productIndexInCart = cartExists.products.findIndex(element => element.product._id.toString() === productId);
                    if (productIndexInCart === -1) {
                        if (quantity > productExists.stock)
                            return -1
                        else {
                            cart.products.push({ 'product': productId, 'quantity': quantity });
                            await cart.save();
                        }
                    } else {
                        if ((cart.products[productIndexInCart].quantity + quantity) > productExists.stock)
                            return -1
                        else {
                            cart.products[productIndexInCart].quantity += quantity;
                            await cart.save();
                        }
                    }
                    console.log(`✅ +${quantity} de producto #${productId} agregado al carrito #${cartId}`);
                    return true;
                }
                console.error('⛔ Error: producto o carrito inexistente')
                return false;
            }
            console.error('⛔ Error: se recibieron argumentos no válidos');
            return false;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo guardar el cambio en la BD => error: ${error.message}`);
        }
    }
    
    // Si un producto existe en un carrito determinado, devuelve 'true'. Caso contrario, devuelve 'false'
    static async isProductInCart(cid, pid) {
        try {
            let productFoundInCart = false;
            let productSearchIndex = 0;
            if (mongoose.isValidObjectId(cid) && mongoose.isValidObjectId(pid)) {
                const cartExists = await this.getCartById(cid);
                const productExists = await ProductManager.getProductById(pid);
                if (cartExists && productExists) {
                    while (!productFoundInCart && productSearchIndex < Object.values(cartExists.products).length) {
                        if (Object.values(cartExists.products)[productSearchIndex].product._id.toString() === pid) {
                            productFoundInCart = true;
                        }
                        productSearchIndex++;
                    }
                }
            }
            if (!productFoundInCart)
                console.error(`⛔ Error: no se encontró el producto #${pid} en el carrito #${cid}`);
            return productFoundInCart;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar la existencia del producto #${pid} en el carrito #${cid} => error: ${error.message}`)
        }
    }

    // En caso de encontrarlo, elimina todos los productos del carrito indicado. Si el carrito no existe, devuelve 'false'
    static async deleteCart(id) {
        try {
            if (mongoose.isValidObjectId(id)) {
                const cart = this.getCartById(id);
                if (cart) {
                    return await cartModel.updateOne({ _id: id }, { $set: { products: [] } });
                }
            }
            return false;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el carrito con id#${id} => error: ${error.message}`)
        }
    }

    // Borra un producto de un carrito determinados por argumentos. 
    // En caso de no poder hacerlo, devuelve 'false'
    static async deleteProductFromCart(cid, pid) {
        try {
            let productDeletedFromCart = false;
            let productSearchIndex = 0;
            if (mongoose.isValidObjectId(cid) && mongoose.isValidObjectId(pid)) {
                const cartExists = await cartModel.findById(cid);
                const productExists = await ProductManager.getProductById(pid);
                if (cartExists && productExists) {
                    while (!productDeletedFromCart && productSearchIndex < Object.values(cartExists.products).length) {
                        if (Object.values(cartExists.products)[productSearchIndex].product._id.toString() === pid) {
                            cartExists.products.splice(productSearchIndex, 1);
                            await cartExists.save();
                            productDeletedFromCart = true;
                        }
                        productSearchIndex++;
                    }
                }
            }
            return productDeletedFromCart;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar la existencia del producto #${pid} en el carrito #${cid} => error: ${error.message}`)
        }
    }
}

module.exports = { Cart, CartManager };