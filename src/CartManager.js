// Se realizan los imports mediante 'require', de acuerdo a lo visto en clase
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ProductManager } = require('./ProductManager.js');
const { log } = require('console');


// Clase Cart, con su correspondiente contructor las props definidas en la consigna
class Cart {
    constructor() {
        this.id = uuidv4();
        this.products = [];
    }
}

const path = "./src/carts.json";
let carts = [];

// Clase CartManager con su constructor tal como se solicitó, con un array 'products' vacío
class CartManager {

    // Devuelve el array con todos los productos creados hasta el momento (para verificación)
    static async getCarts() {
        if (fs.existsSync(path)) {
            try {
                carts = JSON.parse(await fs.promises.readFile(path, "utf-8"));
                return carts;
            } catch (error) {
                throw new Error(`⛔ Error: No se pudo leer el archivo de Carritos => error: ${error.message}`);
            }
        } else {
            console.error("⛔ Error: El archivo de Carritos no existe.");
            return undefined;
        }
    }

    // En caso de encontrarlo, devuelve un objeto 'Carrito' de acuerdo a id proporcionado por argumento.
    // En caso de no encontrarlo, imprime error en la consola.
    static async getCartById(id) {
        let cartFound = undefined;
        try {
            carts = await CartManager.getCarts();
            carts.forEach(cart => {
                if (cart.id === id) cartFound = cart;
            })
            if (cartFound === undefined) {
                console.error(`⛔ Error: Carrito id '${id}' no encontrado`);
            }
            return cartFound;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo consultar al carrito por id => error: ${error.message}`);
        }
    }

    // Agrega un producto al array 'products'
    static async addCart() {
        if (fs.existsSync(path)) {
            try {
                await CartManager.getCarts();
                const newCart = new Cart();
                carts.push(newCart);
                await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"), "utf-8");
                console.log(`✅ Carrito '${newCart.id}' agregado exitosamente`);
                return newCart.id;
            } catch (error) {
                throw new Error(`⛔ Error: No se pudo grabar el archivo de Carritos => error: ${error.message}`);
            }
        } else {
            try {
                const newCart = new Cart();
                carts.push(newCart);
                await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"), "utf-8");
                console.log(`✅ Carrito '${newCart.id}' agregado exitosamente`);
                return newCart.id;
            } catch (error) {
                throw new Error(`⛔ Error al crear el archivo JSON de carritos => error: ${error.message}`);
            }
        }
    }

    static async addProductToCart(cartId, productId, quantity) {
        if (fs.existsSync(path)) {
            try {
                carts = await CartManager.getCarts();
                const cartIndex = Object.values(carts).findIndex((element) => element.id === cartId);
                const productExists = await ProductManager.getProductById(productId);
                let productAlreadyExist = false;
                let productIndex = 0;
                if (cartIndex === -1 || !productExists) {
                    return false;
                } else {
                    while (!productAlreadyExist && productIndex < Object.keys(carts[cartIndex].products).length) {
                        if (carts[cartIndex].products[productIndex].product === productId) {
                            productAlreadyExist = true;
                        } else {
                            productIndex++;
                        }
                    }
                }
                if (!productAlreadyExist) {
                    carts[cartIndex].products.push({ "product": productId, "quantity": quantity })
                    await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"), "utf-8");
                    console.log(`✅ +${quantity} '${productExists.title}' agregado al Carrito '${cartId}'`);
                    return true;
                } else {
                    carts[cartIndex].products[productIndex].quantity += quantity;
                    await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"), "utf-8");
                    console.log(`✅ +${quantity} '${productExists.title}' agregado al Carrito '${cartId}'`);
                    return true;
                }

            } catch (error) {
                throw new Error(`⛔ Error: No se pudo grabar el archivo de Carritos.=> error: ${error.message}`);
            }
        } else {
            console.error(`⛔ Error: debe crear el archivo JSON utilizando el método POST '/api/carts/'`)
            return undefined;
        }
    }

}

module.exports = { Cart, CartManager };