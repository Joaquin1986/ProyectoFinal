// Se realizan los imports mediante 'require', de acuerdo a lo visto en clase
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ProductManager } = require('./ProductManager.js');
const { readJsonDataFromFile } = require('../utils/utils.js')

/* Si bien cuando implementemos BD la funcion de lectura sera asincronica, como en esta primer
   pre-entrega trabajamos con archivos, se lee de forma sincronica solamente la carga inicial de carritos.
   El resto de las operaciones se ejecutan de forma asincrona*/
const file = 'carts.json';
let carts = readJsonDataFromFile(file);

// Clase Cart, con su correspondiente contructor las props definidas en la consigna
class Cart {
    constructor() {
        this.id = uuidv4();
        this.products = [];
    }
}

// Clase CartManager con su constructor tal como se solicitó, con un array 'products' vacío
class CartManager {

    // Devuelve el array con todos los productos creados hasta el momento (para verificación)
    static getCarts() {
        return carts;
    }

    // En caso de encontrarlo, devuelve un objeto 'Carrito' de acuerdo a id proporcionado por argumento.
    // En caso de no encontrarlo, imprime error en la consola.
    static getCartById(id) {
        let cartFound = undefined;
        carts.forEach(cart => {
            if (cart.id === id) cartFound = cart;
        })
        if (cartFound === undefined) {
            console.error(`⛔ Error: Carrito id '${id}' no encontrado`);
        }
        return cartFound;
    }

    // Agrega un producto al array 'products'
    static async addCart() {
        try {
            const newCart = new Cart();
            carts.push(newCart);
            await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"), "utf-8");
            console.log(`✅ Carrito '${newCart.id}' agregado exitosamente`);
            return newCart.id;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo grabar el archivo de Carritos => error: ${error.message}`);
        }
    }

    static async addProductToCart(cartId, productId, quantity) {
        if (fs.existsSync(path)) {
            try {
                const cartIndex = Object.values(carts).findIndex((element) => element.id === cartId);
                const productExists = ProductManager.getProductById(productId);
                let productAlreadyExist = false;
                let productIndex = 0;
                if (cartIndex === -1 || !productExists) {
                    return false;
                }
                while (!productAlreadyExist && productIndex < Object.keys(carts[cartIndex].products).length) {
                    if (carts[cartIndex].products[productIndex].product === productId) {
                        productAlreadyExist = true;
                    } else {
                        productIndex++;
                    }
                }
                if (!productAlreadyExist) {
                    carts[cartIndex].products.push({ "product": productId, "quantity": quantity })
                } else {
                    carts[cartIndex].products[productIndex].quantity += quantity;
                }
                await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"), "utf-8");
                console.log(`✅ +${quantity} '${productExists.title}' agregado al Carrito '${cartId}'`);
                return true;

            } catch (error) {
                throw new Error(`⛔ Error: No se pudo grabar el archivo de Carritos.=> error: ${error.message}`);
            }
        } else {
            console.error(`⛔ Error: debe crear el archivo JSON utilizando el método POST '/api/carts/'`)
            return undefined;
        }
    }

}

function readCartsFromFile() {
    if (fs.existsSync(path)) {
        try {
            return JSON.parse(fs.readFileSync(path, "utf-8"));
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo leer el archivo de Carritos.
Descripción del error: ${error.message}`);
        }
    } else {
        return [];
    }
}

module.exports = { Cart, CartManager };