// Definición de constantes y variables
const basicToast = {
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: false,
};
const errorToast = Swal.mixin({ ...basicToast, background: '#bb0606' });
const successToast = Swal.mixin({ ...basicToast, background: '#097e0f' });

const cartId = document.getElementsByClassName('cartDetails')[0].id;

//Función de borrado de Carrito
async function deleteCart(url) {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                "Accept": "*/*"
            },
        });
        if (response.ok) {
            disableMainButtons();
            successToast.fire({
                text: "El carrito fue borrado exitosamente",
                icon: "success"
            }).then(() => {
                localStorage.removeItem('currentCartId');
                window.location.href = '/views/products';
            });
        } else {
            errorToast.fire({
                icon: "error",
                text: "Error al borrar el carrito"
            });
            return false;
        }
    } catch (error) {
        errorToast.fire({
            icon: "error",
            text: "Ocurrió el siguiente error: " + error.message
        });
        return false;
    }
}

async function removeProductFromCart(event) {
    const productId = event.target.id.split('remove-')[1];
    const removeButtons = document.getElementsByClassName('outline secondary');
    for (let i = 0; i < removeButtons.length; i++) {
        removeButtons[i].disabled = true;
        removeButtons[i].setAttribute('aria-busy', 'true');
        removeButtons[i].innerText = ''
    }
    try {
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: 'DELETE',
            headers: {
                "Accept": "*/*"
            },
        });
        if (response.ok) {
            const data = await response.json();
            displayProductsInTable(data.remainingProducts, data.fromCart);
            successToast.fire({
                text: "El producto fue borrado del carrito",
                icon: "success"
            });
            for (let i = 0; i < removeButtons.length; i++) {
                removeButtons[i].disabled = false;
                removeButtons[i].ariaBusy = false;
                removeButtons[i].innerText = '🗑'
            }
        } else {
            errorToast.fire({
                icon: "error",
                text: "No se pudo borrar el producto del carrito"
            });
            return false;
        }
    } catch (error) {
        console.log(error);
        errorToast.fire({
            icon: "error",
            text: "Ocurrió el siguiente error: " + error.message
        });
        return false;
    }
}

function backToProducts() {
    disableMainButtons();
    window.location.href = '/views/products';
}

function displayProductsInTable(products, cartId) {
    const cartDetailsDiv = document.getElementById('cartDetailsDiv');
    if (Object.values(products).length > 0) {
        let totalPrice = 0;
        let productTrArray = [];
        let productTrBlock = '';
        Object.values(products).forEach(product => {
            console.log(product)
            totalPrice += product.product.price;
            const newTr = document.createElement('tr');
            newTr.innerHTML = `
                 <th scope="row">${product.product.title}</th>
                        <td>${product.quantity}</td>
                        <td>${product.product.price}</td>
                        <td><button class="outline secondary" id="remove-${product.product._id}"
                                onclick="removeProductFromCart(event)">🗑</button></td>
            `;
            productTrArray.push(newTr);
        });
        console.log(productTrArray);
        productTrArray.forEach(productCode => {
            productTrBlock += '<tr>' + productCode.innerHTML + '</tr>';
        });
        console.log(productTrBlock);
        cartDetailsDiv.innerHTML = '';
        cartDetailsDiv.innerHTML = `
               <article>
            <header>
                <h3 class="cartDetails" id="${cartId}">Detalle del Carrito 🛒</h3>
            </header>
            <table id="cartDetailsTable">
                <thead>
                    <tr>
                        <th scope="col">Producto</th>
                        <th scope="col">Cantidad</th>
                        <th scope="col">Precio</th>
                        <th scope="col">Quitar</th>
                    </tr>
                </thead>
                <tbody id="tbodyProducts">
                ${productTrBlock}
                <tfoot>
                    <tr>
                        <th scope="row"><b>Subtotal</b></th>
                        <td><b>${Object.values(products).length}</b></td>
                        <td><b>${totalPrice}</b></td>
                        <td></td>
                    </tr>
                    <tr>
                        <th scope="row"><b>Total(IVA 23%)</b></th>
                        <td><b>${Object.values(products).length}</b></td>
                        <td><b>${(totalPrice * 1.23)}</b></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <footer>
                <div role="button" class="primary" tabindex="0" id="cartCheckoutButton">Enviar Orden📦</div>
                <div role="button" class="secondary" onclick="deleteCart('/api/carts/${cartId}')" tabindex="0"
                    id="cartDeleteButton">Borrar Carrito 🗑</div>
                <div role="button" class="secondary" onclick="backToProducts(event)" tabindex="0" id="cartBackButton">
                    Volver
                    a Productos 🏡</div>
            </footer>
        </article>
        `;
    } else {
        cartDetailsDiv.innerHTML = '';
        cartDetailsDiv.innerHTML = `<div id="cartNoValidDiv">
                                        <h2 id="noProductsH2">
                                        Carrito vacío esperando que <a href = "/views/products" >elijas productos 📦</a>
                                        </h2>
                                    </div> `;
    }
}

function disableMainButtons(){
    const cartDeleteButton = document.getElementById('cartDeleteButton');
    const cartCheckoutButton = document.getElementById('cartCheckoutButton');
    const cartBackButton = document.getElementById('cartBackButton');
    cartDeleteButton.disabled = true;
    cartDeleteButton.setAttribute('aria-busy', 'true');
    cartDeleteButton.innerText = '';
    cartCheckoutButton.disabled = true;
    cartCheckoutButton.setAttribute('aria-busy', 'true');
    cartCheckoutButton.innerText = '';
    cartBackButton.disabled = true;
    cartBackButton.setAttribute('aria-busy', 'true');
    cartBackButton.innerText = '';
}