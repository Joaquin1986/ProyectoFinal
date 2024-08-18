const path = require('path');
const multer = require('multer');
const fs = require('fs');

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

module.exports = {
    uploadMulter,
    publicPath,
    viewsPath,
    thumbnailsPath,
    readJsonDataFromFile
};