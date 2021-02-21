require('dotenv').config()

const Telegraf = require('telegraf')
const functions = require('./libs/functions')
const session = require('telegraf/session')
const bot = new Telegraf(process.env.BOT_TOKEN)

// const CHANNEL_ID = process.env.CHANNEL_ID
// const ADMINLIST = bot.telegram.getChatAdministrators(CHANNEL_ID)

bot.use(session())
bot.use((ctx, next) => {
  const start = new Date()
  const ms = new Date() - start
  console.log('Response time: %sms', ms) // tempo de resposta
  functions.verificar(ctx, next)
})

bot.hears('hey', (ctx) => {
  ctx.reply('oi')
})

const startCommand = require('./src/commands/start')
startCommand(bot)

const editCommand = require('./src/commands/edit')
editCommand(bot)

const infoCommand = require('./src/commands/info')
infoCommand(bot)

const TMDbQuery = require('./src/inlinehandlers/api-TMDb')
TMDbQuery(bot)

const apagarAction = require('./src/actions/apagar')
apagarAction(bot)

const pingHandler = require('./src/handlers/ping')
pingHandler(bot)

const autoeditHandler = require('./src/handlers/autoedit-ch-post')
autoeditHandler(bot)

const answerHandler = require('./src/handlers/replylogger')
answerHandler(bot)

const removeKeyboardHandler = require('./src/handlers/remove-keyboard')
removeKeyboardHandler(bot)

const newpostCommand = require('./src/commands/newpost')
newpostCommand(bot)

const newpostAction = require('./src/actions/newpost')
newpostAction(bot)

// const repostCommand = require('./src/commands/repost')
// repostCommand(bot)

bot.on('message', (ctx, next) => {
  console.log('chegou ao launch()')
  next()
})

bot.launch()

/* AWS Lambda handler function */
/* exports.handler = (event, context, callback) => {
  const tmp = JSON.parse(event.body); // get data passed to us
  bot.handleUpdate(tmp); // make Telegraf process that data
  return callback(null, { // return something for webhook, so it doesn't try to send same stuff again
    statusCode: 200,
    body: '',
  });
}; */

