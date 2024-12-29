const secrets = require('./secrets');
const { REFUSED } = require('dns');
const telegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = secrets.token;

const bot = new telegramBot(token, {polling: true});


bot.setMyCommands([
    {command: '/start', description: 'Welcome message'},
    {command: '/generate', description: 'Generate a temporary email address'},
    {command: '/stop', description: 'Stop the bot'},
    {command: '/emails', description: 'Get emails'}
]);

// bot.setChatDescription('Welcome to EspectroMail, the best email generator bot. To get started, type /generate to get a temporary email address.');

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
         "Welcome to EspectroMail, the best email generator bot. To get started, type /generate to get a temporary email address.");
});


bot.onText(/\/generate/, async (msg) => {
    var email=await getTempMail();
    bot.sendMessage(msg.chat.id, `Your temporary email address is: ${email}`);
});


async function getTempMail(){
    try{
        var endPoint='https://10minutemail.com/session/address';
        var res=await fetch(endPoint,Headers={
            'user-Agent':'PostmanRuntime/7.43.0',
            'Connection':'keep-alive',
            'accept':'*/*',
            'accept-encoding':'gzip, deflate, br',
            'accept-language':'en-US,en;q=0.9',
            'Cache-Control':'no-cache'
        });
        var Email= await res.json();
        return Email.address;
    }
    catch(exc){
        return 'Bot is down. Please try again later.',exc;
    }
}

async function getEmails(){
    var endPoint='10minutemail.com//messages/messagesAfter/0';
    var res=await fetch(endPoint);
    var Emails= await res.json();
    return Emails;
}

bot.onText(/\/stop/,(msg)=>{
    bot.sendMessage(msg.chat.id, "Goodbye! Come back soon.");
})

bot.onText(/\/emails/, async (msg) => {
    var emails=await getEmails();
    bot.sendMessage(msg.chat.id, `Your emails are: ${emails}`);
});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please use commands to interact with the bot.');
});