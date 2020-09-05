
module.exports = bot => {
  bot.hears(/^p.ng$/i, ctx => {
    if ( ctx.chat.type === 'private' && ctx.message.text) {

      // Verifica se a mensagem é 'ping', se sim responde 'pong'
      if (ctx.message.text.match(/^ping$/i)) {
        ctx.telegram.sendMessage(ctx.message.from.id, 'pong', {reply_to_message_id: ctx.message.message_id})
      } else {
        ctx.telegram.sendMessage(ctx.message.from.id, 'ping', {reply_to_message_id: ctx.message.message_id})
      }
    }
  })
}