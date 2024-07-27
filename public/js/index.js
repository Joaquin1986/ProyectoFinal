const { value: userName } = Swal.fire({
    title: "Ingresa tu nombre, por favor",
    input: "text",
    inputPlaceholder: "<Tu nombre aquí>",
    inputValidator: (value) => {
        if (!value) {
            return "Es de cortesía presentarse 😊";
        }
    }
}).then((response) => {
    const div = document.getElementById('mainDiv');
    div.innerHTML = `<h1>Bienvenid@ al Home🏡, ${response.value}</h1>`;
});




