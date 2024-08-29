const path = require('path');
const multer = require('multer');
const fs = require('fs');

const baseURL = "http://localhost:8080/";
const publicPath = path.join(__dirname, '../../public');
const viewsPath = path.join(__dirname, '../views');
const thumbnailsPath = path.join(__dirname, '../../public/img/thumbnails');

/* Se configura Multer para que los guarde en el directorio 'public/thumbnails' y que mantenga el
nombre de los archivos, agregando un sufijo para asegurar que sea únicos */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, thumbnailsPath);
    },
    filename: function (req, file, cb) {
        const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniquePreffix + '-' + file.originalname);
    }
});

const uploadMulter = multer({ storage: storage });

function readJsonDataFromFile(file) {
    const filePath = path.join(__dirname, '..', 'data', file);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo leer el archivo "${filePath}".
Descripción del error: ${error.message}`);
        }
    } else {
        return [];
    }
}

const preBuildResponse = (data) => {
    const response = {
        "status": 'success',
        "payload": data.docs,
        "totalPages": data.totalPages,
        "prevPage": data.prevPage,
        "nextPage": data.nextPage,
        "page": data.page,
        "hasPrevPage": data.hasPrevPage,
        "hasNextPage": data.hasNextPage
    }
    return response;
}

const buildResponse = (data, type, sort, query) => {
    const preData = preBuildResponse(data);
    let prevLink, nextLink;
    if (data.hasPrevPage) {
        prevLink = `${baseURL}${type}/products?limit=${data.limit}&page=${data.prevPage}`;
        if (sort) prevLink += '&sort=' + sort;
        if (query) prevLink += '&query=' + query;
    } else {
        prevLink = null;
    }
    if (data.hasNextPage) {
        nextLink = `${baseURL}${type}/products?limit=${data.limit}&page=${data.nextPage}`;
        if (sort) nextLink += '&sort=' + sort;
        if (query) nextLink += '&query=' + query;
    } else {
        nextLink = null;
    }
    let response = {
        ...preData,
        "prevLink": prevLink,
        "nextLink": nextLink
    }
    if (type === 'views') {
        let firstLink, lastLink;
        firstLink = `${baseURL}views/products?limit=${data.limit}&page=1`;
        lastLink = `${baseURL}views/products?limit=${data.limit}&page=${data.totalPages}`
        if (sort) {
            firstLink = firstLink + '&sort=' + sort;
            lastLink = lastLink + '&sort=' + sort;
        }
        if (query) {
            firstLink = firstLink + '&query=' + query;
            lastLink = lastLink + '&query=' + query;
        }
        response = {
            ...response,
            "firstLink": firstLink,
            "lastLink": lastLink,
            "totalDocs": data.totalDocs
        }
    }
    return response;
}

module.exports = {
    uploadMulter,
    publicPath,
    viewsPath,
    thumbnailsPath,
    readJsonDataFromFile,
    buildResponse
};