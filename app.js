const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

mongoose.connect('mongodb+srv://dart-hit:qwerty123zxc34@cluster0.ap1ucz1.mongodb.net/rodrigo-bot', { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Connected to MongoDB');
});

const token = '6702573814:AAHGbtvnTCSuwO7Es82IaRRENfSzHrBMXqw';

const bot = new TelegramBot(token, { polling: true });

const chatLink = `https://t.me/@LionelMess3`;

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name;

    User.findOne({ chatId: chatId })
        .then((existingUser) => {
            if (existingUser) {
                console.log('Пользователь уже существует:', `${existingUser} \nMsg ID:${msg.chat.id} - UserID: ${existingUser.chatId}`);
                return;
            }
            const newUser = new User({
                firstName: msg.from.first_name,
                lastName: msg.from.last_name,
                username: msg.from.username,
                chatId: msg.chat.id,
                directed: false
            });

            newUser.save()
                .then((savedUser) => {
                    console.log('Пользователь сохранён:', savedUser);
                })
                .catch((error) => {
                    console.error('Ошибка при сохранении пользователя', error);
                });
        })
        .catch((error) => {
            console.error('Ошибка при поиске пользователя:', error);
        });

    bot.getMe().then((me) => {
        const botName = me.first_name;

        const videoNoteFilePath = 'source/preview-video.mp4';
        const videoCaption = `Hola 👋 ${userName}\n\n` +
            `Encantado de conocerte, mi nombre es ${botName}.\n\n` +
            'El caso es que por algo has llegado hasta aquí. Tienes unas ganas locas de ganar mucho dinero. Me encantaría ayudarte en este empeño.\n\n' +
            'Me honra ver que mis esfuerzos marcan la diferencia en la vida de otras personas. Todos los que tenían deudas las han saldado y han empezado una nueva vida.\n\n' +
            'Personas de mi equipo tienen ahora familias numerosas y no necesitan nada.\n\n' +
            'Esto me hace feliz, ¡y te ayudaré a que TÚ también te hagas rico!';

        const videoOptions = {
            caption: videoCaption,
        };

        const keyboard = {
            inline_keyboard: [
                [{ text: 'Escríbeme ✍️', callback_data: 'escribeme_command', url: chatLink, }],
                [{ text: 'Cómo funciona el programa', callback_data: 'como_funciona_el_programa' }],
            ],
        };

        videoOptions.reply_markup = keyboard;

        bot.sendDocument(chatId, videoNoteFilePath, videoOptions).catch((error) => {
            console.error(error);
        });
    }).catch((error) => {
        console.error(error);
    });
});


async function comoTestimonios(chatId, callbackQuery) {
    try {
        function isPhoto(fileUrl) {
            return fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg') || fileUrl.endsWith('.png');
        }

        const reviews = await Reviews.find({});

        console.log('Reviews:', reviews);

        for (const review of reviews) {
            const fileUrl = review.file;
            const videoCaption = review.text;

            console.log('File URL:', fileUrl);
            console.log('Video Caption:', videoCaption);

            const videoOptions = {
                caption: videoCaption,
            };

            if (isPhoto(fileUrl)) {
                await bot.sendPhoto(chatId, fileUrl, videoOptions);
            } else {
                await bot.sendDocument(chatId, fileUrl, videoOptions);
            }
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }

    bot.answerCallbackQuery(callbackQuery.id);
}

async function comoFuncionaElPrograma(chatId, callbackQuery) {
    const videoNoteFilePath = 'source/reg-video.mp4';

    const videoCaption = `Es hora de cambiar tu vida ❤️🫂.\n\n` +
        'La esencia es sencilla: la app predice desde dónde partirá el avión, y siempre lo hace con precisión. Lo que ves en la pantalla es el multiplicador por el que se multiplicará tu apuesta.\n\n' +
        'Puedes conseguir esta app gratis durante 7 días.\n\n' +
        'Para ello, debes aceptar nuestros acuerdos de usuario:\n\n' +
        '1) Confirmo que no retiraré cantidades que excedan el límite permitido por el regulador de mi país.\n\n' +
        '2) Confirmo que no tengo adicción al juego y que estoy dispuesto a hacer todo con cuidado y atención.\n\n' +
        'Registrarse ';

    const videoOptions = {
        caption: videoCaption,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Escríbeme ✍️', callback_data: 'escribeme_command', url: chatLink }],
                [{ text: 'Testimonios', callback_data: 'testimonials' }],
            ],
        },
    };

    bot.sendDocument(chatId, videoNoteFilePath, videoOptions).catch((error) => {
        console.error(error);
    });

    bot.answerCallbackQuery(callbackQuery.id);
}

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    const diceOptions = {
        emoji: '🎯', 
        disable_notification: true, 
        reply_to_message_id: msg.message_id 
    };
    bot.sendDice(chatId, diceOptions)
        .then((sent) => {
            console.log(sent);
        })
        .catch((error) => {
            console.error(error);
        });
     
    if (action === 'como_funciona_el_programa') {
        comoFuncionaElPrograma(chatId, callbackQuery);
    } else if (action === 'testimonials') {
        comoTestimonios(chatId, callbackQuery);
    }
});

const reviewSchema = new mongoose.Schema({
    _id: ObjectId,
    file: String,
    text: String,
});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    chatId: String,
    directed: Boolean
});

const User = mongoose.model('users', userSchema);
const Reviews = mongoose.model('Review', reviewSchema);