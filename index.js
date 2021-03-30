'use strict'
require('dotenv').config()
const {
  verificar,
  elapsedTime,
  getStartedTime
} = require('./src/functions/functions')
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const bot = new Telegraf(process.env.BOT_TOKEN)
const CHANNEL_ID = process.env.CHANNEL_ID
const MODO_ATIVO = process.env.MODO_ATIVO || 'oficial'

bot.use(session())
bot.use((ctx, next) => {
  getStartedTime()
  verificar(ctx, next)
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

const autoeditHandler = require('./src/handlers/autoEditChannelPost')
autoeditHandler(bot)

const answerHandler = require('./src/handlers/replylogger')
answerHandler(bot)

const deleteSystemMessageHandler = require('./src/handlers/deleteSystemMessage')
deleteSystemMessageHandler(bot)

const removeKeyboardCommand = require('./src/commands/remove-keyboard')
removeKeyboardCommand(bot)

const newpostCommand = require('./src/commands/newpost')
newpostCommand(bot)

const newpostAction = require('./src/actions/newpost')
newpostAction(bot)

const linkToAroundPostsHandler = require('./src/handlers/linkToAroundPosts')
linkToAroundPostsHandler(bot)

const repostCommand = require('./src/commands/repost')
repostCommand(bot)

bot.on('message', (ctx, next) => {
  console.log('chegou ao launch()')
  console.log('Execution time:', elapsedTime() + 'ms.')
  next()
})

bot.launch()