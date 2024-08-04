const socket = io();

const statusButtons = document.getElementsByClassName('statusProductButton');
const deleteButtons = document.getElementsByClassName('deleteProductButton');

const basicToast = {
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 10000,
    timerProgressBar: false,
    color: 'var(--pico-color)'
};

const errorToast = Swal.mixin({ ...basicToast, background: '#fc0000' });

const successToast = Swal.mixin({ ...basicToast, background: '#097e0f' });

const addProductButton = document.getElementById('addButton');

addProductButton.addEventListener('click', async (e) => {
    let bodyContent = new FormData();
    let result;
    await Swal.fire({
        title: "Crear Nuevo Producto",
        html: `
          <form id="newProdForm">
          <input type="text" name="title" aria-label="Title" placeholder="Nombre del producto(*)" id="title" required>
          <input type="text" name="description" aria-label="description" placeholder="Descripción del producto(*)" id="description" required>
          <input type="text" name="price" aria-label="price" placeholder="Precio del producto(*)" id="price" required>
          <input type="file" name="thumbnails" placeholder="Imagen del producto" class="thumbnails" id="fileInput" required>
          <input type="text" name="code" aria-label="Code" placeholder="Código del producto(*)" id="code" required>
          <select name="favorite-cuisine" id="status" aria-label="Select your favorite cuisine..." required>
          <option selected disabled value="" required>
          Estado del Producto(*)
          </option>
          <option value="true">Habilitado</option>
          <option value="false">Deshablitado</option>
                </select>
          <input type="text" name="stock" aria-label="Stock" placeholder="Stock del producto(*)" id="stock" required>
          <input type="text" name="category" aria-label="Category" placeholder="Categoría del producto(*)" id="category" required>
          </form>
        `,
        confirmButtonText: 'Crear Producto',
        focusConfirm: false,
        preConfirm: () => {
            if (!document.getElementById("title").value ||
                !document.getElementById("description").value ||
                !document.getElementById("price").value ||
                !document.getElementById("code").value ||
                !document.getElementById("status").value ||
                !document.getElementById("stock").value ||
                !document.getElementById("category").value) {
                Swal.showValidationMessage(`Debes ingresar todos los campos requeridos (*)`)
            } else {
                const fileInput = document.getElementById("fileInput");
                result = {
                    "title": document.getElementById("title").value,
                    "description": document.getElementById("description").value,
                    "price": document.getElementById("price").value,
                    "code": document.getElementById("code").value,
                    "status": document.getElementById("status").value,
                    "stock": document.getElementById("stock").value,
                    "category": document.getElementById("category").value,
                };
                fileInput.files.length > 0 ?
                    result = { ...result, "thumbnails": window.URL.createObjectURL(fileInput.files[0]) } :
                    result = { ...result, "thumbnails": [] };
                return result;
            }
        }
    });
    if (result) {
        bodyContent.append("title", result.title);
        bodyContent.append("description", result.description);
        bodyContent.append("price", result.price);
        bodyContent.append("code", result.code);
        bodyContent.append("status", result.status);
        bodyContent.append("stock", result.stock);
        bodyContent.append("category", result.category);
        bodyContent.append("thumbnails", result.thumbnails);
        const newProductId = await createProduct("http://localhost:8080/api/products", bodyContent);
        if (newProductId) {
            socket.emit('newProduct', newProductId);
        }
    }
});

for (i = 0; i < Object.keys(statusButtons).length; i++) {
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

for (i = 0; i < Object.keys(deleteButtons).length; i++) {
    deleteButtons[i].addEventListener('click', (event) => {
        productId = event.target.id.split('delete-')[1];
        if (!productId) {
            productId = event.target.id.split('status-enable-')[1];
        }
        socket.emit('delete', productId);
    });
}
''
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
        status ? text.innerText = 'Estado: Activo' : text.innerText = 'Estado: Desactivado';
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
                text: `Hubo un error y no se pudo ${errorAction} el status del producto id#${productId}"`
            });
        } else {
            errorToast.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hubo un error y no se pudo ${errorAction} el status del producto id#${productId}"`
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
            text: `Hubo un error y no se pudo borrar el producto id#${productId}"`
        });
    }
});


socket.on('newProduct', (newProduct, clientId) => {
    const successSwal = {
        icon: 'success',
        title: `Producto creado`,
        text: `Se ha creado el producto id#${newProduct.id}"`
    };
    // Se creó un nuevo producto
    let innerButtonHTML = '';
    let statusText = '';
    if (newProduct.status) {
        innerButtonHTML = '<button class="statusProductButton" id="status-disable-' + newProduct.id + '">Desact.🔒</button>';
        statusText = 'Activo';
    } else {
        innerButtonHTML = '<button class="statusProductButton" id="status-enable-' + newProduct.id + '">Activar🔓</button>';
        statusText = 'Desactivado';
    }
    const divProducts = document.getElementById('productsGrid');
    let newProdDiv = document.createElement('div');
    newProdDiv.classList = 'product';
    newProdDiv.id = `product-${newProduct.id}`;
    newProdDiv.innerHTML = `
            <article class="articleProducto">
                <header>
                    <h3 class="hProd" id="title-${newProduct.id}">${newProduct.title}📦</h3>
                </header>
                <p class="pProd" id="code-${newProduct.id}"><u> Código:</u> ${newProduct.code}</p>
                <hr />
                <p class="pProd" id="description-${newProduct.id}"><u>Descripción:</u> ${newProduct.description}</p>
                <hr />
                <p class="pProd" id="status-${newProduct.id}"><u>Estado:</u> ${statusText}</p>
                <hr />
                <p class="pProd" id="status-${newProduct.id}"><u>Stock:</u> ${newProduct.stock}</p>
                <hr />
                <p class="pProd" id="status-${newProduct.id}"><u>Categoría:</u> ${newProduct.category}</p>
                <hr />
                <p class="pProd" id="status-${newProduct.id}"><u>Precio:</u> $${newProduct.price}</p>
                <footer class="footerProduct">
                    ${innerButtonHTML}
                    <button class="deleteProductButton" id="delete-${newProduct.id}">Borrar🗑</button>
                </footer>
            </article >
        `;
    const h2Total = document.getElementById('h2Total');
    newTotal = parseInt(h2Total.innerText.split('Total: ')[1]) + 1;
    h2Total.innerText = 'Total: ' + newTotal;
    divProducts.appendChild(newProdDiv);
    let statusAction = '';
    newProduct.status ? statusAction = 'disable' : statusAction = 'enable';
    const statusButton = document.getElementById('status-' + statusAction + "-" + newProduct.id);
    const deleteButton = document.getElementById('delete-' + newProduct.id);//event volver a poner, sino no cambia
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
        socket.emit('delete', newProduct.id);
    });
    if (socket.id === clientId) {
        Swal.fire(successSwal);
    } else {
        successToast.fire(successSwal);
    }
});

async function createProduct(url, productForm) {
    try {
        const response = await fetch(url, {
            method: 'POST',
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