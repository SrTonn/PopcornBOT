module.exports = bot => {
  bot.action('apagar', (ctx) => {

    // Id da msg que chamou o comando inicial com o botão "apagar"
    let msgReplyedId = ctx.update.callback_query.message.reply_to_message.message_id

    // apagar msg do callbackbutton
    ctx.deleteMessage()

    // apagar msg do respondida pelo callbackbutton
    ctx.telegram.deleteMessage(ctx.chat.id, msgReplyedId)

  })
}