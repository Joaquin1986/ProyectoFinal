const socket = io();

const statusButtons = document.getElementsByClassName('statusProductButton');
const deleteButtons = document.getElementsByClassName('deleteProductButton');

const basicToast = {
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: false,
    color: 'var(--pico-color)'
};

const errorToast = Swal.mixin({ ...basicToast, background: '#fc0000' });

const successToast = Swal.mixin({ ...basicToast, background: '#097e0f' });

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

socket.on('status', (productId, result, status, clientId) => {
    console.log(socket.id, clientId, socket.id === clientId)
    if (result) {
        let action = '';
        status ? action = 'habilitado' : action = 'deshabilitado';
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
            Swal.fire({
                icon: 'success',
                title: `Producto ${action}`,
                text: `Se ha ${action} el producto id#${productId}"`
            });
        } else {
            successToast.fire({
                icon: 'success',
                title: `Producto ${action}`,
                text: `Se ha ${action} el producto id#${productId}"`
            });
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
        console.log(h2Total.innerText.split('Total: ')[1]);
        newTotal = parseInt(h2Total.innerText.split('Total: ')[1]) - 1;
        console.log(newTotal);
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