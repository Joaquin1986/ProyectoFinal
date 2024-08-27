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

const buildResponseForApi = (data) => {
    const preData = preBuildResponse(data);
    const response = {
        ...preData,
        "prevLink": `${baseURL}api/products?limit=${data.limit}&page=${data.prevPage}`,
        "nextLink": `${baseURL}api/products?limit=${data.limit}&page=${data.nextPage}`
    }
    return response;
}

const buildResponseForView = (data) => {
    const preData = preBuildResponse(data);
    const response = {
        ...preData,
        "prevLink": `${baseURL}views/products?limit=${data.limit}&page=${data.prevPage}`,
        "nextLink": `${baseURL}views/products?limit=${data.limit}&page=${data.nextPage}`,
        "firstLink": `${baseURL}views/products?limit=${data.limit}&page=1`,
        "lastLink": `${baseURL}views/products?limit=${data.limit}&page=${data.totalPages}`,
        "totalDocs": data.totalDocs
    }
    return response;
}

module.exports = {
    uploadMulter,
    publicPath,
    viewsPath,
    thumbnailsPath,
    readJsonDataFromFile,
    buildResponseForApi,
    buildResponseForView
};