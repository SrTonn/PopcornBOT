const Markup = require('telegraf/markup')
const { markdown } = require('telegraf/extra')
const BOT_UNAME = process.env.BOT_UNAME

module.exports = bot => {
  bot.command('newpost', (ctx) => {
    if (ctx.chat.type === 'private')
      return ctx.reply('Aqui você pode criar postagens relevantes.',
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
      )
    else
      return ctx.reply(`Continue no modo [privado](t.me/${BOT_UNAME})`, markdown())
  })
}