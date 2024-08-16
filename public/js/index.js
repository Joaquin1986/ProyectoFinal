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

let currentCartId = localStorage.getItem('currentCartId');
if (!currentCartId) {
  createCart('/api/carts').then(result => {
    currentCartId = result;
    localStorage.setItem('currentCartId', currentCartId);
    displayCartinNav(0);
  });

} else {
  getTotalProductsCount('/api/carts/' + currentCartId).then(count => displayCartinNav(count));
}

//Función de creación de Carrito
async function createCart(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Accept": "*/*"
      },
    });
    if (response.ok) {
      const result = await response.json();
      successToast.fire({
        text: "Nuevo carrito...",
        icon: "success"
      });
      return result.cartId;
    } else {
      errorToast.fire({
        icon: "error",
        text: "Error al crear un carrito"
      });
      return false;
    }
  } catch (error) {
    errorToast.fire({
      icon: "error",
      title: "Error!",
      text: "Ocurrió el siguiente error: " + error.message
    });
    return false;
  }
}

// Función para obtener la cantidad total de productos del carrito
async function getTotalProductsCount(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Accept": "*/*"
      }
    });
    if (response.ok) {
      const parsedResponse = await response.json();
      let productsTotalCount = 0;
      Object.values(parsedResponse.products).forEach(product => {
        productsTotalCount += parseInt(product.quantity);
      })
      return productsTotalCount;
    } else if (response.status === 404) {
      localStorage.removeItem('currentCartId');
      window.location.reload();
    }
    else {
      errorToast.fire({
        icon: "error",
        text: "Error al obtener detalles del carrito en la BD"
      });
      return 0;
    }
  } catch (error) {
    errorToast.fire({
      icon: "error",
      title: "Error!",
      text: "Ocurrió el siguiente error: " + error.message
    });
    return 0;
  }
}

// Función que muestra la cantidad de ítems
function displayCartinNav(productsCount) {
  const liBeforeCart = document.getElementById('liBeforeCart');
  const cart = document.createElement('a');
  cart.innerHTML = '<li id="navCartButton">🛒' + productsCount + '</li>';
  cart.href = '/views/carts/' + currentCartId;
  liBeforeCart.insertAdjacentElement('afterend', cart);
}


function buyProductButton(event) {
  event.target.disabled = true;
  event.target.setAttribute('aria-busy', 'true');
  event.target.innerText = ''
  window.location.href = '/views/products/' + event.target.id;
}
