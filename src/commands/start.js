const config = require('../../config')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

module.exports = (bot) => {

  // handler for /start and /help command
  bot.command(['start', 'help'], ctx => {

    // welcome message
    let message = config.helpMessage
    ctx.reply(message, Extra.markdown()
      .markup(
        Markup.inlineKeyboard([
          [
            {
              text: 'Busca Inline',
              switch_inline_query_current_chat: ''
            }
          ]
        ])
      )
    )
  })
}