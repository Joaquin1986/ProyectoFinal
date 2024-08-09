const { Router } = require('express');

const notFound404 = Router();

notFound404.get('/*', (req, res) => {
    const title = "Sitio no encontrado 🔎";
    res.render('notFound404', { title: title });
});

module.exports = notFound404;