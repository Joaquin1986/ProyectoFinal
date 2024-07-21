// Se definen los modulos a importar
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Clase Cart, con su correspondiente contructor las props definidas en la consigna
class Cart {
    constructor() {
        this.id = uuidv4();
        this.products = [];
    }
}


// Clase CartManager con su constructor tal como se solicitó, con un array 'products' vacío
class CartManager {
    constructor(path) {
        this.path = path;
        fs.existsSync(this.path) ? this.carts = this.getCarts() : this.carts = [];
    }

    // Agrega un producto al array 'products'
    async addCart() {
        if (fs.existsSync(this.path)) {
            try {
                this.carts = await this.getCarts();
                const newCart = new Cart();
                this.carts.push(newCart);
                await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, "\t"), "utf-8");
                console.log(`✅ Carrito '${newCart.id}' agregado exitosamente`);
                return newCart.id;
            } catch (error) {
                throw new Error(`⛔ Error: No se pudo grabar el archivo de Carritos => error: ${error.message}`);
            }
        } else {
            try {
                const newCart = new Cart();
                this.carts.push(newCart);
                await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, "\t"), "utf-8");
                console.log(`✅ Carrito '${newCart.id}' agregado exitosamente`);
                return newCart.id;
            } catch (error) {
                throw new Error(`⛔ Error al crear el archivo JSON de carritos => error: ${error.message}`);
            }
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        let worked = true;
        if (fs.existsSync(this.path)) {
            try {
                this.carts = await this.getCarts();
                let productAlreadyExist = false;
                let cartIndex, cartCount = 0, productIndex, productCount = 0;
                this.carts.forEach((cart) => {
                    if (cart.id === cartId) {
                        cartIndex = cartCount;
                        cart.products.forEach((product) => {
                            if (product.product === productId) {
                                productAlreadyExist = true;
                                productIndex = productCount;
                            }
                            productCount++;
                        });
                    }
                    cartCount++;
                });
                if (!productAlreadyExist) {
                    this.carts[cartIndex].products.push({ "product": productId, "quantity": quantity })
                    await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, "\t"), "utf-8");
                    console.log(`✅ Producto '${productId}' agregado exitosamente al Carrito '${cartId}'`);
                } else {
                    this.carts[cartIndex].products[productIndex].quantity += quantity;
                    await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, "\t"), "utf-8");
                    console.log(`✅ Producto '${productId}' agregado exitosamente al Carrito '${cartId}'`);
                }
                return worked;
            } catch (error) {
                throw new Error(`⛔ Error: No se pudo grabar el archivo de Carritos.=> error: ${error.message}`);
            }
        } else {
            console.error(`⛔ Error: debe crear el archivo JSON utilizando el método POST '/api/carts/'`)
            return undefined;
        }
    }

    // Devuelve el array con todos los productos creados hasta el momento (para verificación)
    async getCarts() {
        if (fs.existsSync(this.path)) {
            try {
                this.carts = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
                return this.carts;
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
    async getCartById(id) {
        let cartFound = undefined;
        try {
            this.carts = await this.getCarts();
            this.carts.forEach(cart => {
                cart.id === id ? cartFound = cart : null;
            })
            if (cartFound === undefined) {
                console.error(`⛔ Error: Carrito id '${id}' no encontrado`);
            }
            return cartFound;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo consultar al carrito por id => error: ${error.message}`);
        }
    }

}

module.exports = { Cart, CartManager };