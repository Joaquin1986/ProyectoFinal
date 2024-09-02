const mongoose = require('mongoose');
const orderModel = require('../models/order.model.js');

// Clase Order. Una vez confirmada la compra del carrito, se genera una orden correspondiente. 
class Order {
    constructor(cart, name, address, email, paymentMethod) {
        this.cart = cart;
        this.name = name;
        this.address = address;
        this.email = email;
        this.paymentMethod = paymentMethod;
    }
}

// Clase OrderManager para el manejo de órdenes
class OrderManager {

    // En caso de encontrarla, devuelve una orden de acuerdo al id proporcionado por argumento
    static async getOrderById(id) {
        try {
            if (mongoose.isValidObjectId(id)) {
                return await orderModel.findById(id).lean();
            }
            return undefined;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe la orden id#${id} => error: ${error.message}`)
        }
    }

    // En caso de encontrar un carrito ya asignado, devuelve "true". Caso contrario, 'false'
    static async isCartAldreadyOrdered(cid) {
        try {
            if (mongoose.isValidObjectId(cid)) {
                return await orderModel.findOne({ cart: cid }).lean();
            }
            return false;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe orden asociada al carrito #${cid} => error: ${error.message}`)
        }
    }

    // Agrega un producto al array 'products'
    static async addOrder(order) {
        try {
            const newOrder = await orderModel.create(order);
            if (newOrder) {
                console.log(`✅ Orden #'${newOrder._id}' agregada exitosamente a la BD`);
                return newOrder._id;
            }
            return false;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo crear la orden en la BD => error: ${error.message}`);
        }
    }

}

module.exports = { Order, OrderManager };