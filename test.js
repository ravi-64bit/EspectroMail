const secrets = require('./secret');
const telegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = secrets.token;
const bot = new telegramBot(token, { polling: true });

let sessionCookies = '';
bot.setMyCommands([
    { command: '/start', description: 'Welcome message' },
    { command: '/generate', description: 'Generate a temporary email address' },
    { command: '/stop', description: 'Stop the bot' },
    { command: '/emails', description: 'Get emails' }
]);

const commands = ['/start', '/generate', '/stop', '/emails'];

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to EspectroMail, the best email generator bot. To get started, type /generate to get a temporary email address.");
});

bot.onText(/\/generate/, async (msg) => {
    const email = await getTempMail();
    bot.sendMessage(msg.chat.id, `Your temporary email address is: ${email}`);
});

async function getTempMail() {
    try {
        const endPoint = 'https://10minutemail.com/session/address';
        const response = await axios.get(endPoint, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Cookie': sessionCookies // Include stored cookies
            }
        });

        // Store cookies from the response
        const setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader) {
            sessionCookies = setCookieHeader.join('; '); // Store cookies for future requests
        }

        return response.data.address; // Return the email address
    } catch (exc) {
        console.error(exc);
        return 'Bot is down. Please try again later.';
    }
}

async function getEmails() {
    try {
        const endPoint = 'https://10minutemail.com//messages/messagesAfter/0';
        const response = await axios.get(endPoint, {
            headers: {
                'Cookie': sessionCookies // Include stored cookies
            }
        });
        return response.data; // Return the emails
    } catch (exc) {
        console.error(exc);
        return 'Could not retrieve emails. Please try again later.';
    }
}

bot.onText(/\/stop/, (msg) => {
    bot.sendMessage(msg.chat.id, "Goodbye! Come back soon.");
});

bot.onText(/\/emails/, async (msg) => {
    const emails = await getEmails();
    bot.sendMessage(msg.chat.id, `Your emails are: ${emails}`);
});

bot.on('message', (msg) => {
    if (!commands.includes(msg.text)) {
        bot.sendMessage(msg.chat.id, "Invalid command. Please use one of the following commands: /start, /generate, /stop, /emails");
    }
});