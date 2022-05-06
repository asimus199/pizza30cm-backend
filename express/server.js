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
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});


// bot.telegram.sendMessage(ordersChatId, '[](tg://user?id=53476657)', { parse_mode: 'MarkdownV2' })
router.post('/order', async (req, res) => {
  let data = req.body || {};
  let order = data.order || {};
  let items = order.items || {};
  let init_data = querystring.parse(data.initData);
  let query_id = init_data.query_id;
  let user = JSON.parse(decodeURIComponent(init_data.user));

  let username = user.first_name ? `${user.first_name} ${user.last_name}` : `@${user.username}`;

  let itemsList = items.map(i => `\\- ${i.name} x${i.quantity} *${i.price}₽*`).join("\r\n");

  var date = moment();
  let time = date.tz('Europe/Moscow').format("DD.MM.yyyy HH:mm");
  time = time.replace(/\./g, "\\.");

  let payMethod = order.payMethod === 'yookassa' ? '\\(Оплата ЮKassa\\)' : '\\(Оплата при получении\\)'
  let message = `
🟡 *Заказ ${query_id}*
🗓 *${time}*

${itemsList}

💵 *${order.price}₽* ${payMethod}
‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
☎️ *\\+7 \\(911\\) 731\\-61\\-05*
🚚 Проспект тп тп
💬 Пятиэтажное здание во дворе
  `;

  let messageManager = `
🟡 *Заказ ${query_id}*
🗓 *${time}*

${itemsList}

💵 *${order.price}₽* ${payMethod}
‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
👤 [${username}](tg://user?id=${user.id})
☎️ *\\+7 \\(911\\) 731\\-61\\-05*
🚚 Проспект тп тп
💬 Пятиэтажное здание во дворе
  `
  console.log(message)
  await bot.telegram.answerWebAppQuery(query_id, {
    "type": "article",
    "id": "1",
    "title": "chek inline keybord ",
    "description": "test ",
    "caption": "caption",
    "input_message_content": {
      "message_text": message,
      "parse_mode": 'MarkdownV2',
    }
  })
  await bot.telegram.sendMessage(ordersChatId, messageManager, { "parse_mode": 'MarkdownV2'})
  res.json({success: true})
});

router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));


module.exports = app;
module.exports.handler = serverless(app);
