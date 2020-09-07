const Markup = require('telegraf/markup')
const { markdown } = require('telegraf/extra')
const bot_uname = process.env.BOT_UNAME

module.exports = bot => {
  bot.command('newpost', (ctx) => {
    console.log(ctx.chat.type == 'private')
    if (ctx.chat.type == 'private')
    return ctx.reply('Aqui você pode criar postagens relevantes.',
      Markup.inlineKeyboard([
        Markup.callbackButton('Criar Post', 'newpost')
      ]).extra()
    )
    else
    return ctx.reply(`Continue no modo [privado](t.me/${bot_uname})`, markdown())
    
  })
}
