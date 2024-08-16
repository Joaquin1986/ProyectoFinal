const socket = io();

const statusButtons = document.getElementsByClassName('statusProductButton');
const deleteButtons = document.getElementsByClassName('deleteProductButton');

const basicToast = {
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: false,
};

const errorToast = Swal.mixin({ ...basicToast, background: '#bb0606' });

const successToast = Swal.mixin({ ...basicToast, background: '#097e0f' });

const addProductButton = document.getElementById('addButton');

addProductButton.addEventListener('click', async (e) => {
    await Swal.fire({
        html: `
        <article>
         <header>
            <h3> Crear Nuevo Producto 📦</h3>
         </header>
          <input type="text" name="title" aria-label="Title" placeholder="Nombre del producto(*)" id="title" required>
          <input type="text" name="description" aria-label="description" placeholder="Descripción del producto(*)" id="description" required>
          <input type="text" name="price" aria-label="price" placeholder="Precio del producto(*)" id="price" required>
          <input type="text" name="code" aria-label="Code" placeholder="Código del producto(*)" id="code" required>
          <select name="status" id="status" aria-label="Estado del Producto" required>
          <option selected disabled value="" required>
          Estado del Producto(*)
          </option>
          <option value="true">Habilitado</option>
          <option value="false">Deshablitado</option>
                </select>
          <input type="text" name="stock" aria-label="Stock" placeholder="Stock del producto(*)" id="stock" required>
          <input type="text" name="category" aria-label="Category" placeholder="Categoría del producto(*)" id="category" required>
          <div id="filesDiv">
          <h5 id="prodImagesH5">Imagenes del Producto 📷</h5>
            <button id="addFileField" onClick="addFileField()">➕</button>
            <button id="removeFileField" onClick="removeFileField()">➖</button>
          </div>
          <footer>
          <input type="button" value="Crear Producto" onClick="preConfirm()">
          <input type="button" class="secondary" value="Cancelar" onClick="Swal.close()">
          </footer>
        </article>
        `,
        showConfirmButton: false,
        focusConfirm: false,
        showCloseButton: false,
        allowOutsideClick: false
    });
});

for (let i = 0; i < Object.keys(statusButtons).length; i++) {
    statusButtons[i].addEventListener('click', (event) => {
        let status = false;
        productId = event.target.id.split('status-disable-')[1];
        if (!productId) {
            productId = event.target.id.split('status-enable-')[1];
            status = true;
        }
        socket.emit('status', productId, status);
    });
}

for (let i = 0; i < Object.keys(deleteButtons).length; i++) {
    deleteButtons[i].addEventListener('click', (event) => {
        productId = event.target.id.split('delete-')[1];
        if (!productId) {
            productId = event.target.id.split('status-enable-')[1];
        }
        socket.emit('delete', productId);
    });
}

socket.on('status', (productId, result, status, clientId) => {
    if (result) {
        let action = '';
        status ? action = 'habilitado' : action = 'deshabilitado';
        const successSwal = {
            icon: 'success',
            title: `Producto ${action}`,
            text: `Se ha ${action} el producto id#${productId}"`
        };
        // Se realizó el cambio de status
        let text = document.getElementById('status-' + productId);
        status ? text.innerHTML = '<u>Estado:</u> Activo' : text.innerHTML = '<u>Estado:</u> Desactivado';
        let button = document.getElementById('status-disable-' + productId);
        if (button && button.innerText === 'Desact.🔒') {
            button.id = 'status-enable-' + productId;
            button.innerText = 'Activar🔓'
        } else {
            button = document.getElementById('status-enable-' + productId);
            button.id = 'status-disable-' + productId;
            button.innerText = 'Desact.🔒';
        }
        if (socket.id === clientId) {
            Swal.fire(successSwal);
        } else {
            successToast.fire(successSwal);
        }
    } else {
        let errorAction = '';
        status ? errorAction = 'habilitar' : errorAction = 'deshabilitar';
        // No se pudo realizar el cambio de status
        if (socket.id === clientId) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hubo un error y no se pudo ${errorAction} el status del producto id#${productId}`
            });
        } else {
            errorToast.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hubo un error y no se pudo ${errorAction} el status del producto id#${productId}`
            });
        }
    }
});

socket.on('delete', (productId, result) => {
    if (result) {
        // Se realizó la baja del producto
        const divProd = document.getElementById('product-' + productId);
        const h2Total = document.getElementById('h2Total');
        newTotal = parseInt(h2Total.innerText.split('Total: ')[1]) - 1;
        h2Total.innerText = 'Total: ' + newTotal;
        divProd.remove();
        errorToast.fire({
            icon: "error",
            title: `Se eliminó el producto id #${productId}`
        });
    } else {
        // No se pudo realizar la baja del producto
        errorToast.fire({
            icon: 'error',
            text: `Hubo un error y no se pudo borrar el producto id#${productId}`
        });
    }
});


socket.on('newProduct', (newProduct, clientId) => {
    const successSwal = {
        icon: 'success',
        title: `Producto creado`,
        text: `Se ha creado el producto id#${newProduct._id}`
    };
    // Se recibe mensaje socket por creación de un nuevo producto
    const noProductH2 = document.getElementById('noProductsH2');
    if (noProductH2) {
        noProductH2.remove();
    }
    let innerButtonHTML = '';
    let statusText = '';
    if (newProduct.status) {
        innerButtonHTML = '<button class="statusProductButton" id="status-disable-' + newProduct._id + '">Desact.🔒</button>';
        statusText = 'Activo';
    } else {
        innerButtonHTML = '<button class="statusProductButton" id="status-enable-' + newProduct._id + '">Activar🔓</button>';
        statusText = 'Desactivado';
    }
    const divProducts = document.getElementById('productsGrid');
    let newProdDiv = document.createElement('div');
    newProdDiv.classList = 'product';
    newProdDiv.id = `product-${newProduct._id}`;
    newProdDiv.innerHTML = `
            <article class="articleProduct">
                <header>
                    <h3 class="hProd" id="title-${newProduct._id}">${newProduct.title}📦</h3>
                    <div class="productImages" id="images-${newProduct._id}"></div>
                </header>
                <p class="pProd" id="code-${newProduct._id}"><u> Código:</u> ${newProduct.code}</p>
                <hr />
                <p class="pProd" id="description-${newProduct._id}"><u>Descripción:</u> ${newProduct.description}</p>
                <hr />
                <p class="pProd" id="status-${newProduct._id}"><u>Estado:</u> ${statusText}</p>
                <hr />
                <p class="pProd" id="status-${newProduct._id}"><u>Stock:</u> ${newProduct.stock}</p>
                <hr />
                <p class="pProd" id="status-${newProduct._id}"><u>Categoría:</u> ${newProduct.category}</p>
                <hr />
                <p class="pProd" id="status-${newProduct._id}"><u>Precio:</u> $${newProduct.price}</p>
                <footer class="footerProduct">
                    ${innerButtonHTML}
                    <button class="deleteProductButton" id="delete-${newProduct._id}">Borrar🗑</button>
                </footer>
            </article >
        `;
    const h2Total = document.getElementById('h2Total');
    if (h2Total) {
        newTotal = parseInt(h2Total.innerText.split('Total: ')[1]) + 1;
        h2Total.innerText = 'Total: ' + newTotal;
    } else {
        const newTotalH2 = document.createElement('h2');
        newTotalH2.id = 'h2Total';
        newTotalH2.classList = 'hProd';
        newTotalH2.innerText = 'Total: 1';
        const titleH1 = document.querySelector('h1');
        titleH1.insertAdjacentElement('afterend', newTotalH2);
    }
    divProducts.appendChild(newProdDiv);
    const imagesDiv = document.getElementById('images-' + newProduct._id);
    if (Object.keys(newProduct.thumbnails).length > 0) {
        for (let i = 0; i < Object.keys(newProduct.thumbnails).length; i++) {
            const newThumb = document.createElement('img');
            newThumb.src = newProduct.thumbnails[i];
            newThumb.alt = 'Imagen del Producto ' + newProduct.title;
            imagesDiv.appendChild(newThumb);
        }
    } else {
        const noImagesMessage = document.createElement('p');
        noImagesMessage.innerText = 'El producto aún no tiene imágenes';
        imagesDiv.appendChild(noImagesMessage);
    }
    let statusAction = '';
    newProduct.status ? statusAction = 'disable' : statusAction = 'enable';
    const statusButton = document.getElementById('status-' + statusAction + "-" + newProduct._id);
    const deleteButton = document.getElementById('delete-' + newProduct._id);
    statusButton.addEventListener('click', (event) => {
        let newStatus = false;
        productId = event.target.id.split('status-disable-')[1];
        if (!productId) {
            productId = event.target.id.split('status-enable-')[1];
            newStatus = true;
        }
        socket.emit('status', productId, newStatus);
    });
    deleteButton.addEventListener('click', () => {
        socket.emit('delete', newProduct._id);
    });
    if (socket.id !== clientId) {
        successToast.fire(successSwal);
    }
});

//Función de creación de Producto
async function createProduct(url, productForm) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Accept": "*/*"
            },
            body: productForm
        });
        if (response.ok) {
            const result = await response.json();
            Swal.fire({
                title: "Producto creado!",
                text: "Se creó el producto id #" + result.productId,
                icon: "success"
            });
            return result.productId;
        } else {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: `Error al intentar crear el producto: ${response.status} -> ${response.statusText}`
            });
            return false;
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: `Ocurrió un error al intentar crear el producto: ${error.message}`
        });
        return false;
    }
}

// Función de validación de formulario
async function preConfirm() {
    let result = false;
    let bodyContent = new FormData();
    let preConfirmPrice = true;
    let preConfirmStock = true;
    if (!document.getElementById("title").value ||
        !document.getElementById("description").value ||
        !document.getElementById("price").value ||
        !document.getElementById("code").value ||
        !document.getElementById("status").value ||
        !document.getElementById("stock").value ||
        !document.getElementById("category").value) {
        Swal.showValidationMessage(`Debes ingresar todos los campos requeridos (*)`)
        preConfirmPrice = false;
        preConfirmStock = false;
    }
    const priceInput = document.getElementById("price");
    const stockInput = document.getElementById("stock");
    const smallPriceAlreadyThere = document.getElementById('invalid-helper-price');
    const smallStockAlreadyThere = document.getElementById('invalid-helper-stock');
    if (!parseInt(priceInput.value)) { //Se verifica que el valor del precio no sea NaN
        if (!smallPriceAlreadyThere) {
            priceInput.setAttribute("aria-describedby", "invalid-helper-price");
            const smallInvalidHelperPrice = document.createElement('small');
            smallInvalidHelperPrice.id = 'invalid-helper-price';
            smallInvalidHelperPrice.innerText = 'Se espera un precio numérico';
            priceInput.insertAdjacentElement('afterend', smallInvalidHelperPrice);
        } else {
            smallPriceAlreadyThere.innerText = 'Se espera un precio numérico';
        }
        priceInput.ariaInvalid = 'true';
        Swal.showValidationMessage(`Debes ingresar todos los campos requeridos (*)`);
        preConfirmPrice = false
    } else {
        priceInput.ariaInvalid = 'false';
        const smallInvalidHelperPrice = document.getElementById('invalid-helper-price');
        if (smallInvalidHelperPrice) smallInvalidHelperPrice.innerText = 'El precio ingresado ahora es válido'
        preConfirmPrice = true;
    }
    if (!parseInt(stockInput.value)) { //Se verifuca que el valor del stock no sea NaN
        if (!smallStockAlreadyThere) {
            stockInput.setAttribute('aria-describedby', 'invalid-helper-stock');
            const smallInvalidHelperStock = document.createElement('small');
            smallInvalidHelperStock.id = 'invalid-helper-stock';
            smallInvalidHelperStock.innerText = 'Se espera una cantidad numérica de stock';
            stockInput.insertAdjacentElement('afterend', smallInvalidHelperStock);
        } else {
            smallStockAlreadyThere.innerText = 'Se espera una cantidad numérica de stock';
        }
        stockInput.ariaInvalid = 'true';
        Swal.showValidationMessage(`Debes ingresar todos los campos requeridos (*)`);
        preConfirmStock = false
    } else {
        if (smallStockAlreadyThere) {
            stockInput.ariaInvalid = 'false';
            const smallInvalidHelperStock = document.getElementById('invalid-helper-stock');
            if (smallInvalidHelperStock) smallInvalidHelperStock.innerText = 'La cantidad de stock ahora es válida'
            preConfirmStock = true;
        }
    }
    if (preConfirmPrice && preConfirmStock) {
        result = {
            "title": document.getElementById("title").value,
            "description": document.getElementById("description").value,
            "price": document.getElementById("price").value,
            "code": document.getElementById("code").value,
            "status": document.getElementById("status").value,
            "stock": document.getElementById("stock").value,
            "category": document.getElementById("category").value,
        };
    }
    if (result) {
        bodyContent.append("title", result.title);
        bodyContent.append("description", result.description);
        bodyContent.append("price", result.price);
        bodyContent.append("code", result.code);
        bodyContent.append("status", result.status);
        bodyContent.append("stock", result.stock);
        bodyContent.append("category", result.category);
        const fileInput = document.getElementsByClassName("thumbnails");
        if (fileInput) {
            for (let i = 0; i < fileInput.length; i++) {
                if (fileInput[i].files[0]) bodyContent.append("thumbnails", fileInput[i].files[0]);
            }
        }
        const newProductId = await createProduct("/api/products", bodyContent);
        if (newProductId) {
            socket.emit('newProduct', newProductId);
        }
    };
}

//

function addFileField() {
    const maxPics = 5;
    const allFileInput = document.getElementsByClassName('thumbnails');
    const newFileInput = document.createElement('input');
    let allowNewInput = true;
    const productImagesH6 = document.getElementById('prodImagesH6');
    if (productImagesH6) productImagesH6.remove();
    if (allFileInput.length >= maxPics) {
        if (!document.getElementById('errorH6')) {
            const errorH6 = document.createElement('h6');
            errorH6.id = 'errorH6';
            errorH6.innerText = `⛔No se permiten más de ${maxPics} imágenes por producto`;
            allFileInput[allFileInput.length - 1].insertAdjacentElement('afterend', errorH6);
        }
        //Swal.showValidationMessage(`No se permiten más de ${maxPics} imágenes por producto`);
        allowNewInput = false;
    } else {
        for (let i = 0; i < allFileInput.length; i++) {
            const smallFileAlreadyExists = document.getElementById('invalid-helper-file' + (i + 1));
            if (!allFileInput[i].files[0]) {
                allowNewInput = false;
                if (!smallFileAlreadyExists) {
                    allFileInput[i].ariaInvalid = 'true';
                    allFileInput[i].setAttribute("aria-describedby", "invalid-helper-file" + (i + 1));
                    const smallInvalidHelperFile = document.createElement('small');
                    smallInvalidHelperFile.id = 'invalid-helper-file' + (i + 1);
                    smallInvalidHelperFile.innerText = 'No hay archivo seleccionado';
                    allFileInput[i].insertAdjacentElement('afterend', smallInvalidHelperFile);
                } else {
                    smallFileAlreadyExists.remove();
                }
            } else {
                allFileInput[i].ariaInvalid = 'false';
                if (smallFileAlreadyExists) smallFileAlreadyExists.remove();
            }
        }
    }

    if (allowNewInput) {
        newFileInput.classList = 'thumbnails';
        newFileInput.type = 'file';
        newFileInput.accept = 'image/*';
        newFileInput.label
        count = allFileInput.length + 1;
        newFileInput.id = 'fileInput' + count;
        newFileInput.addEventListener('change', (event) => {
            if (event.target.files[0]) {
                newFileInput.ariaInvalid = 'false';
                const indexHelper = parseInt(event.target.id.split('fileInput')[1]) + 1;
                const helperToDelete = document.getElementById('invalid-helper-file' + indexHelper);
                if (helperToDelete) helperToDelete.remove();
            } else {
                event.target.ariaInvalid = 'true';
            }
        });
        if (allFileInput.length > 0) allFileInput[allFileInput.length - 1].insertAdjacentElement('afterend', newFileInput);
        else {
            const prodImagesH5 = document.getElementById('prodImagesH5');
            prodImagesH5.insertAdjacentElement('afterend', newFileInput);
        }
    }
}

function validateFileInput(event) {
    if (event.target.files[0]) {
        event.target.ariaInvalid = 'false';
        const helperToDelete = document.getElementById('invalid-helper-file1');
        if (helperToDelete) helperToDelete.remove();
    } else {
        event.target.ariaInvalid = 'true';
    }
}

function removeFileField() {
    const allFileInput = document.getElementsByClassName('thumbnails');
    helperText = 'Ya no quedan fotos por quitar';
    if (allFileInput.length > 0) {
        const invalidHelper = document.getElementById('invalid-helper-file' + allFileInput.length);
        if (invalidHelper) invalidHelper.remove();
        allFileInput[allFileInput.length - 1].remove();
    } else {
        const productImagesH6Exists = document.getElementById('prodImagesH6');
        if (!productImagesH6Exists) {
            const productImagesH6 = document.createElement('h6');
            productImagesH6.id = 'prodImagesH6';
            productImagesH6.innerText = helperText;
            productImagesH6.style.color = '#ce7e7b';
            const prodImagesH5 = document.getElementById('prodImagesH5');
            prodImagesH5.insertAdjacentElement('afterend', productImagesH6);;
        }
    }
}