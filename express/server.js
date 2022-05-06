'use strict';
const express = require('express');
const path = require('path');
const querystring = require('querystring');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const moment = require('moment-timezone')
const { Telegraf, Markup } = require('telegraf')
let ordersChatId = -507976908;

const bot = new Telegraf('5262311380:AAEZkvr3DUuIQ5DVUeniWduH9rWIMqFS3sk')
bot.start((ctx) => {
  console.log(ctx)
  ctx.reply('Welcome to burger')
})
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));


module.exports = app;
module.exports.handler = serverless(app);
