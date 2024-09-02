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

let cartId;
if (document.getElementsByClassName('cartDetails')[0])
    cartId = document.getElementsByClassName('cartDetails')[0].id;

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
                text: "Carrito borrado exitosamente",
                icon: "success"
            }).then(() => {
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
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                "Accept": "*/*"
            },
        });
        if (response.ok) {
            const data = await response.json();
            displayProductsInTable(data.remainingProducts, data.fromCart);
            successToast.fire({
                text: "Producto borrado del carrito",
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
                text: "Error al borrar el producto del carrito"
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

function backToProducts(event) {
    if (event.target.id === 'cartBackButton') {
        disableMainButtons()
    } else if (event.target.id === 'cartBackButtonSecondary') {
        disableSecondaryButtons();
    } else {
        const cartBackButtonThird = document.getElementById('cartBackButtonThird');
        cartBackButtonThird.disabled = true;
        cartBackButtonThird.setAttribute('aria-busy', 'true');
        cartBackButtonThird.innerText = '';
    }
    window.location.href = '/views/products';
}

function displayProductsInTable(products, cartId) {
    const cartDetailsDiv = document.getElementById('cartDetailsDiv');
    if (Object.values(products).length > 0) {
        let totalPrice = 0;
        let productTrArray = [];
        let productTrBlock = '';
        Object.values(products).forEach(product => {
            totalPrice += product.product.price;
            const newTr = document.createElement('tr');
            newTr.innerHTML = `
                 <th scope="row">${product.product.title}</th>
                        <td>${product.quantity}</td>
                        <td>$${product.product.price}</td>
                        <td><button class="outline secondary" id="remove-${product.product._id}"
                                onclick="removeProductFromCart(event)">🗑</button></td>
            `;
            productTrArray.push(newTr);
        });
        productTrArray.forEach(productCode => {
            productTrBlock += '<tr>' + productCode.innerHTML + '</tr>';
        });
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
                        <td><b>$${totalPrice}</b></td>
                        <td></td>
                    </tr>
                    <tr>
                        <th scope="row"><b>Total(IVA 23%)</b></th>
                        <td><b>${Object.values(products).length}</b></td>
                        <td><b>$${Math.round(totalPrice * 1.23)}</b></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <footer>
                <div role="button" class="primary" tabindex="0" id="cartCheckoutButton" onclick="printOrderForm()">Enviar Orden📦</div>
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

function disableMainButtons() {
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

function disableSecondaryButtons() {
    const placeOrderButton = document.getElementById('placeOrderButton');
    const cartBackButtonSecondary = document.getElementById('cartBackButtonSecondary');
    placeOrderButton.disabled = true;
    placeOrderButton.setAttribute('aria-busy', 'true');
    placeOrderButton.innerText = '';
    cartBackButtonSecondary.disabled = true;
    cartBackButtonSecondary.setAttribute('aria-busy', 'true');
    cartBackButtonSecondary.innerText = '';
}

function printOrderForm() {
    const cartDetailsDiv = document.getElementById('cartDetailsDiv');
    cartDetailsDiv.innerHTML = '';
    cartDetailsDiv.innerHTML = `
    <form>
  <fieldset>
    <label>
      Nombre Completo
      <input
        id="nameInput"
        name="name"
        placeholder="<Nombre completo aquí>"
        autocomplete="name"
        required
      />
    </label>
        <label>
      Dirección
      <input
        id="addressInput"
        name="address"
        placeholder="<Dirección aquí>"
        autocomplete="shipping"
        required
      />
    </label>
    <label>
      Email
      <input
        type="email"
        id="emailInput"
        name="email"
        placeholder="<Email aquí>"
        autocomplete="email"
        required
      />
    </label>
    <legend>Medio de Pago:
      <label>
    <input class="paymentMethodInput" type="radio" name="paymentMethod" checked value="cash"/>
    Efectivo💵
  </label>
  <label>
    <input class="paymentMethodInput" type="radio" name="paymentMethod" value="card" />
    Tarjeta💳
  </label>
  </legend>
  </fieldset>
  <div
    role="button"
    onclick="placeNewOrder()"
    id="placeOrderButton"
  >Confirmar Orden 📃</div>
  <div
    role="button"
    class="secondary"   
    onclick="backToProducts(event)"
    id="cartBackButtonSecondary"
  >Volver a Productos 🏡</div>
</form>
    `;
}

async function placeNewOrder() {
    const form = document.querySelector('form');
    const name = document.getElementById('nameInput').value;
    const address = document.getElementById('addressInput').value;
    const email = document.getElementById('emailInput').value;
    const radioPaymentMethod = document.getElementsByClassName('paymentMethodInput');
    let paymentMethodChosen = '';
    for (let i = 0; i < radioPaymentMethod.length; i++) {
        if (radioPaymentMethod[i].checked) paymentMethodChosen = radioPaymentMethod[i].value;
    }
    if (!name || !address || !email) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: `Datos incompletos, por favor llenar el formulario completo   `
        });
    } else {
        const objData = {
            "name": name,
            "address": address,
            "email": email,
            "paymentMehod": paymentMethodChosen
        }
        try {
            const response = await fetch('/api/carts/' + cartId + '/order', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(objData)
            });
            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    text: "Orden #" + result.order + " confirmada!",
                    icon: "success"
                });
                disableSecondaryButtons();
                const cartDetailsDiv = document.getElementById('cartDetailsDiv');
                cartDetailsDiv.innerHTML = '';
                const orderSucceededDiv = document.createElement('div');
                orderSucceededDiv.innerHTML = `<h1>Orden #${result.order} confirmada! ✅</h1>`;
                orderSucceededDiv.id = 'orderSucceededDiv';
                cartDetailsDiv.appendChild(orderSucceededDiv);
                const backButtonDiv = document.createElement('div');
                backButtonDiv.innerHTML = ` <div
                                                role="button"
                                                class="secondary"   
                                                onclick="backToProducts(event)"
                                                id="cartBackButtonThird"
                                                >Volver a Productos 🏡</div>`;
                localStorage.removeItem('currentCartId');
                cartDetailsDiv.appendChild(backButtonDiv);
            } else {
                const result = await response.json();
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: `No se pudo confirmar la orden: ${result.error}`
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: `Error interno al confirmar la orden: ${error}`
            });
        }
    }
}