
module.exports = bot => {
  bot.hears(/^p(i|o)ng$/i, ctx => {
    if (ctx.chat.type === 'private' && ctx.message.text) {

      // Verifica se a mensagem é 'ping', se sim grava 'pong' na memória
      let answer = ctx.message.text.match(/^ping$/i) ? 'pong' : 'ping'
      ctx.reply(answer, {reply_to_message_id: ctx.message.message_id})
    }
  })
}