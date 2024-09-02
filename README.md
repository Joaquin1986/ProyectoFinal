# Proyecto FINAL de Backend I. Coderhouse (Comisión 70095)

[Proyecto FINAL de Backend I] para Comisión 70095 de Coderhouse

## Descripción de la App

Se trata de una APP de e-commerce desarrollada en lenguaje JavaScript (NodeJS), que implementa API REST y Vistas (HTML y JS del lado cliente) para su funcionamiento. Contiene todo lo visto a lo largo del curso, por lo cual implementa todo lo solicitado en las pre-entregas más lo que se pide en la entrega final (tomando en cuenta que la persistencia es en MongoDB, en lugar de archivos JSON).

## Ejecución de la App

Luego de descargar o clonar el proyecto, se debe copiar o crear un archivo .env en la raíz del proyecto con el siguiente f  ormato dentro:

###  `URI ="<string de conexión a MongoDB>"`

Posicionados en el directorio de la APP, se pueden ejecutar los siguientes comandos en una CLI (ya sea Poowershell, Bash o la que se elija):

### `npm start`

Este comando ejecuta la app en modo 'productivo'.
Por defecto, el puerto en el cual trabaja la app el 8080 pero puede ser modificado. En todo caso, puede abrirse la dirección [http://localhost:8080](http://localhost:8080) (o especificando el puerto modificado) para visualizar la app desde browser de elección (se recomienda Chrome). 

### `npm run dev`

Este comando ejecuta la app en modo 'desarrollo'. Es necesario contar con [nodemon](https://www.npmjs.com/package/nodemon) para ello.

## Componentes Necesarios (NPM Import)

La App necesita la importación/import (se recomienda [NPM](https://www.npmjs.com/)) de los siguientes componentes:

✔️ dotenv ([https://www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv))<br>
✔️ express ([https://www.npmjs.com/package/express](https://www.npmjs.com/package/express))<br>
✔️ express-handlebars ([https://www.npmjs.com/package/express-handlebars](https://www.npmjs.com/package/express-handlebars))<br>
✔️ mongoose ([https://www.npmjs.com/package/mongoose](https://www.npmjs.com/package/mongoose))<br>
✔️ mongoose-paginate-v2 ([https://www.npmjs.com/package/mongoose-paginate-v2](https://www.npmjs.com/package/mongoose-paginate-v2))<br>
✔️ multer ([https://www.npmjs.com/package/mongoose](https://www.npmjs.com/package/multer))<br>
✔️ socket.io ([https://www.npmjs.com/package/mongoose](https://www.npmjs.com/package/socket.io))<br>

## Estructura de la App

La App está desarrollada con la siguiente estructura para su mejor organización y fácil escalabilidad.

### `public`

En esta carpeta hay tres subcarpetas, que tienen diferentes cometidos:

✔️ '/css' - carpeta destinada a almacenar los estilos que se utilizarán en las vistas presentadas al cliente<br>
✔️ '/img' - carpeta destinada a almacenar las thumbnails que se subirán por multer, imágenes que se presentan en las vistas al cliente, favicon, etc.<br>
✔️ '/js' - carpeta donde se encuentran los archivos JavaScript asociados a las vistas que se presentan y SocketIO del lado del cliente<br>

### `src`

Carpeta donde se encuentra el código fuente del lado del servidor, cuya subestructura se detalla a continuación:

✔️ '/controllers' - ubicación de los controllers o managers implementados<br>
✔️ '/db' - ubicación del archivo de conexión con la base de datos MongoDB.<br>
✔️ '/models' - ubicación de los modelos y esquemas de la BD <br>
✔️ '/routes' - ubicación de las rutas de la APP, tanto de la API como de las vistas<br>
✔️ '/server' - ubicación del archivo de configuración/conexión del servidor <br>
✔️ '/socket' - ubicación del archivo de configuración/conexión del socket del lado del servidor<br>
✔️ '/utils' - ubicación del archivo con código utilizado/reutilizado a lo largo de la APP<br>
✔️ '/views' - ubicación de los archivos de vistas implementadas mediante Handlebars<br>
✔️ '/app.js' - archivo inicial de la APP (definido en 'package.json')<br>
✔️ '/.env' - archivo con la configuración de acceso a la BD, implementado mediante DOTENV<br>
✔️ '/.gitignore' - archivo con la configuración de archivos/carpetas que deben ignorarse al hacer un push al repo<br>
✔️ '/package.json' - archivo 'package.json' de la APP con la configuración necesaria<br>
✔️ '/package-lock.json' - archivo 'package-lock.json' de la APP<br>
✔️ '/README.md' - archivo README (el que estás leyendo en este momento😊)<br>

## Estilos CSS en vistas (lado cliente)

Los estilos CSS asociados a las vistas de la App están configurados en el archivo 'styles.css' bajo la carpeta 'public/css' de la APP.
