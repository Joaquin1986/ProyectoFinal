const { Router } = require('express');

const indexViewsRouter = Router();


indexViewsRouter.get('/', (req, res) => {
    const title = "APP -> Home🏡";
    res.render('index', { title: title });
});

module.exports = indexViewsRouter;