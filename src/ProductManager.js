// Se definen los módulos a importar
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


// Clase Product, con su correspondiente contructor las props definidas en la consigna
class Product {
    constructor(title, description, price, code, stock) {
        this.id = uuidv4();
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnails = [];
        this.code = code;
        this.status = true;
        this.stock = stock;
    }
}

// Clase ProductManager con su constructor tal como se solicitó, con un array 'products' vacío
class ProductManager {
    constructor(path) {
        this.path = path;
        fs.existsSync(this.path) ? this.products = this.getProducts() : this.products = [];
    }

    // Agrega un producto al array 'products'
    async addProduct(product) {
        let worked = true;
        if (fs.existsSync(this.path)) {
            try {
                this.products = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
                let productAlreadyExist = this.products.find((item) => item.code === product.code);
                if (!productAlreadyExist) {
                    try {
                        this.products.push(product);
                        await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, "\t"), "utf-8");
                        console.log(`✅ Producto '${product.title}' agregado exitosamente`);
                    } catch (error) {
                        throw new Error(`⛔ Error: ${error.message}`);
                    }
                } else {
                    worked = false;
                    console.error(`⛔ Error: Código de Producto ya existente (Código:'${productAlreadyExist.code}'|Producto:'${productAlreadyExist.title}')`);
                }
                return worked;
            } catch (error) {
                throw new Error(`⛔ Error: No se pudo grabar el archivo de Productos.
   Descripción del error: ${error.message}`);
            }
        } else {
            try {
                this.products.push(product);
                await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, "\t"), "utf-8");
                console.log(`✅ Producto '${product.title}' agregado exitosamente`);
                return worked;
            } catch (error) {
                worked = false;
                throw new Error(`⛔ Error al crear el archivo JSON de productos: ${error.message}`);
            }
        }
    }

    // Devuelve el array con todos los productos creados hasta el momento
    async getProducts() {
        if (fs.existsSync(this.path)) {
            try {
                this.products = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
                return this.products;
            } catch (error) {
                throw new Error(`⛔ Error: No se pudo leer el archivo de Productos.
   Descripción del error: ${error.message}`);
            }
        } else {
            console.error("⛔ Error: El archivo de Productos no existe.");
            return undefined;
        }
    }

    // En caso de encontrarlo, devuelve un objeto 'Producto' de acuerdo a id proporcionado por argumento.
    // En caso de no encontrarlo, imprime error en la consola.
    async getProductById(id) {
        let productFound = undefined;
        try {
            this.products = await this.getProducts();
            this.products.forEach(product => {
                product.id === id ? productFound = product : null;
            })
            if (productFound === undefined) {
                console.error(`⛔ Error: Producto id #${id} no encontrado`);
            }
            return productFound;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con id: ${id} => error: ${error.message}`);
        }
    }

    // En caso de encontrarlo, devuelve un objeto 'Producto' de acuerdo al codigo proporcionado por argumento.
    // En caso de no encontrarlo, imprime error en la consola.
    async getProductByCode(code) {
        let productFound = undefined;
        try {
            this.products = await this.getProducts();
            this.products.forEach(product => {
                product.code === code ? productFound = product : null;
            })
            if (productFound === undefined) {
                console.error(`⛔ Error: Codigo de producto ${code} no encontrado`);
            }
            return productFound;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con el código: ${code} => error: ${error.message}`);
        }
    }

    // Actualiza un producto que es pasado por parámetro en el archivo 'data.json'
    async updateProduct(product) {
        let result = false;
        try {
            this.products = await this.getProducts();
            const index = this.products.findIndex(p => p.id === product.id);
            this.products[index] = product;
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, "\t"), "utf-8");
            console.log(`✅ Producto '${product.id}' actualizado exitosamente`);
            result = true;
            return result;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo actualizar el producto => error: ${error.message}`);
        }
    }

    async deleteProduct(id) {
        let result = false;
        try {
            const productGotten = await this.getProductById(id);
            if (productGotten === undefined) {
                console.error(`⛔ Error: No se pudo borrar el producto`);
                return result;
            } else {
                const index = this.products.findIndex(product => product.id === id);
                this.products.splice(index, 1);
                await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, "\t"), "utf-8")
                console.log(`✅ Producto #${id} eliminado exitosamente`);
                result = true;
                return result;
            }
        } catch {
            return result;
        }
    }

    async productCodeExists(productCode) {
        try {
            this.products = await this.getProducts();
            let productCodeFound = false;
            this.products.forEach(product => {
                if (product.code === productCode) productCodeFound = true;
            });
            return productCodeFound;
        } catch {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con código: ${productCode}`);
        }
    }

    async productIdExists(productId) {
        try {
            this.products = await this.getProducts();
            let productIdFound = false;
            this.products.forEach(product => {
                if (product.id === productId) productIdFound = true;
            });
            return productIdFound;
        } catch {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con código: ${productCode}`);
        }
    }

    existsThumbnail(path) {
        try {
            let exists = false;
            fs.existsSync(path) ? exists = true : exists = false;
            return exists;
        } catch (error) {
            throw new Error(`⛔ Error: no se pudo verificar si existe la thumbnail ${path} => ${error.message}`);
        }
    }

    async deleteThumbnail(path) {
        try {
            if (this.existsThumbnail(path)) {
                await fs.promises.unlink(path);
            }
        } catch (error) {
            throw new Error(`⛔ Error: no se pudo borrar la thumbnail ${path} => ${error.message}`);
        }
    }
}

module.exports = { Product, ProductManager }