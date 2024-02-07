const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multiparty = require('multiparty');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const port = 3000;

const connectionString1 = 'mongodb+srv://dart-hit:qwerty123zxc34@cluster0.ap1ucz1.mongodb.net/spanish-bot';
const connectionString2 = 'mongodb+srv://dart-hit:qwerty123zxc34@cluster0.ap1ucz1.mongodb.net/rodrigo-bot';
const connectionString3 = 'mongodb+srv://dart-hit:qwerty123zxc34@cluster0.ap1ucz1.mongodb.net/test';

mongoose.connect(connectionString1, { useNewUrlParser: true, useUnifiedTopology: true });
const db1 = mongoose.connection;
db1.on('error', console.error.bind(console, 'Ошибка подключения к базе данных spanish-bot:'));
db1.once('open', () => {
  console.log('Успешное подключение к базе данных spanish-bot');
});
mongoose.connect(connectionString2, { useNewUrlParser: true, useUnifiedTopology: true });
const db2 = mongoose.connection;
db2.on('error', console.error.bind(console, 'Ошибка подключения к базе данных rodrigo-bot:'));
db2.once('open', () => {
  console.log('Успешное подключение к базе данных rodrigo-bot');
});
mongoose.connect(connectionString3, { useNewUrlParser: true, useUnifiedTopology: true });
const db3 = mongoose.connection;
db3.on('error', console.error.bind(console, 'Ошибка подключения к базе данных test:'));
db3.once('open', () => {
  console.log('Успешное подключение к базе данных test');
});

const reviewSchema = new mongoose.Schema({
    file: Buffer,
    text: String,
});


const corsOptions = {
    origin: 'https://spanish-bot-crud-production.up.railway.app/',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
    res.sendFile(__dirname);
});
app.use('/uploads', express.static('uploads'));

const LuizReviews = mongoose.model('reviews', reviewSchema, 'spanish-bot');
app.post('/luiz/add', (req, res) => {
    var form = new multiparty.Form();

    form.parse(req, async function (err, fields, files) {
        let file = files.file[0];

        if (file) {

            const buffer = fs.readFileSync(file.path);

            const maxFileSize = 125 * 1024; // 125 КБ в байтах

            if (buffer.length > maxFileSize) {
                const resizedBuffer = await sharp(buffer)
                .resize({ fit: 'inside', width: 500 })
                .toBuffer();
                
                if (resizedBuffer.length > maxFileSize) {
                    console.log("Error: File size still exceeds limit after resizing");
                    res.status(400).json({ error: 'Размер файла превышает 125КБ' });
                    return;
                }
                
                file.buffer = resizedBuffer;
            } else {
                file.buffer = 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Error-logo.png';
            }
            
            const newItem = new LuizReviews({
                file: file.buffer,
                text: '@kipikh',
            });
            
            await newItem.save();
            // res.json({ fileUrl: `/uploads/${btoa(String.fromCharCode.apply(null, new Uint8Array(newItem.file.data)))}` });
        }
        else {
            console.log("Error: File missing!")
        }
    });

});
app.get('/luiz/items', async (req, res) => {
    try {
        const items = await LuizReviews.find({});
        res.json(items);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
app.delete('/luiz/delete/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        await LuizReviews.findOneAndDelete({ _id: itemId });
        res.sendStatus(200);
    } catch (error) {
        console.error('Ошибка при удалении отзыва', error);
        res.sendStatus(500);
    }
});

const RodrigoReviews = mongoose.model('reviews', reviewSchema, 'rodrigo-bot');
app.post('/rodrigo/add', (req, res) => {
    var form = new multiparty.Form();

    form.parse(req, async function (err, fields, files) {
        let file = files.file[0];

        if (file) {

            const buffer = fs.readFileSync(file.path);

            const maxFileSize = 125 * 1024; // 125 КБ в байтах

            if (buffer.length > maxFileSize) {
                const resizedBuffer = await sharp(buffer)
                    .resize({ fit: 'inside', width: 500 })
                    .toBuffer();

                if (resizedBuffer.length > maxFileSize) {
                    console.log("Error: File size still exceeds limit after resizing");
                    res.status(400).json({ error: 'Размер файла превышает 125КБ' });
                    return;
                }

                file.buffer = resizedBuffer;
            } else {
                file.buffer = 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Error-logo.png';
            }

            const newItem = new RodrigoReviews({
                file: file.buffer,
                text: '@kipikh',
            });

            await newItem.save();
            // res.json({ fileUrl: `/uploads/${btoa(String.fromCharCode.apply(null, new Uint8Array(newItem.file.data)))}` });
        }
        else {
            console.log("Error: File missing!")
        }
    });

});
app.get('/rodrigo/items', async (req, res) => {
    try {
        const items = await RodrigoReviews.find({});
        res.json(items);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
app.delete('/rodrigo/delete/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        await RodrigoReviews.findOneAndDelete({ _id: itemId });
        res.sendStatus(200);
    } catch (error) {
        console.error('Ошибка при удалении отзыва', error);
        res.sendStatus(500);
    }
});

app.listen(port, () => {
    console.log('Server is running');
});
