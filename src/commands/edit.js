const Extra = require('telegraf/extra')
const BOT_UNAME = process.env.BOT_UNAME

module.exports = bot => {
  bot.command(['edit', 'e', 'editar', `editar${BOT_UNAME}`], ctx => {

    // regex de busca para pegar (ano||qualidade)
    const regExBusc = /[12][019]\d{2}(?!p)|720p|1080p|#pedido|#legendado/img

    // regex de edicao para remover (ano/qualidade/#pedido/#Legendadado)
    const regExEdi = /\s?[([]?[12][019]\d{2}(?!p)[)\]]?|\s?720p|\s?1080p|#pedido|#legendado/img
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.caption.match(regExBusc)) {

      let descOrig = ctx.message.reply_to_message.caption // descricao original
      // let cPostId = ctx.message.reply_to_message.message_id //Channel Post Id
      let fileId = ctx.message.reply_to_message.video.file_id // File_Id do video

      // Nova descricao \/
      let newCap = descOrig.split(regExEdi).join('')

      // Responder com Video
      ctx.replyWithVideo(fileId,
        Extra.load({caption: newCap,
          reply_to_message_id: ctx.message.message_id})
          .markdown()
          .markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Apagar', 'apagar')
            ]
          )
        )
      )
    }
  })
}