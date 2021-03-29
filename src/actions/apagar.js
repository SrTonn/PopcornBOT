const Extra = require('telegraf/extra')

module.exports = bot => {
  bot.action(/apagar/, async (ctx) => {

    // Id da msg que chamou o comando inicial com o botão "apagar"
    let msgReplyedId = ctx.update.callback_query.message.reply_to_message.message_id
    let inputData = ctx.match.input
    let originalMsgId = inputData.split(' ')[1]
    let chatId = String(ctx.chat.id)

    console.log(originalMsgId)
    ctx.answerCbQuery()

    // apagar msg do callbackbutton
    await ctx.deleteMessage()

    // apagar msg do respondida pelo callbackbutton
    ctx.telegram.deleteMessage(ctx.chat.id, msgReplyedId)

    // apagar msg original
    ctx.deleteMessage(originalMsgId)
      .catch(() => {
        ctx.replyWithMarkdown(
          `Erro! A [mensagem original](https://t.me/c/${chatId.slice(4)}/${originalMsgId}) ` +
          'foi postada a mais de 48 horas, e terá que ser apagada manualmente.\n' +
          'Esta mensagem será apagada assim que você deletar o post original!',
          Extra.load({reply_to_message_id: originalMsgId})
        )
      })
  })
}