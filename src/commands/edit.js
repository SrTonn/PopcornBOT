const Extra = require('telegraf/extra')
const BOT_UNAME = '@' + process.env.BOT_UNAME

module.exports = bot => {
  bot.command(['edit', 'e', 'editar', `editar${BOT_UNAME}`], async ctx => {
    const descOrig = ctx.message.reply_to_message.caption || '' // original description

    // regex to catch (year||quality)
    const regExBusc = /[12][019]\d{2}(?!p)|720p|1080p|\s*-\s*@PopcornBR|#pedido|#legendado/img

    // regex to remove (year/quality/ and hashtags -> #pedido/#Legendadado)
    const regExEdi = /\s?[([]?[12][019]\d{2}(?!p)[)\]]?|\s?720p|\s?1080p|#pedido|#legendado/img
    let subtitled = false

    if(descOrig.match(/#legendado/i)) subtitled = true

    if (ctx.message.reply_to_message && descOrig.match(regExBusc)) {
      let lastMsgId = ''
      // let cPostId = ctx.message.reply_to_message.message_id //Channel Post Id
      let fileId = ctx.message.reply_to_message.video.file_id // File_Id of video

      let msgReplyedId = ctx.message.reply_to_message.message_id

      let newCap = descOrig
      // new description \/
      do {
        newCap = newCap
          .split(regExEdi)
          .join('')
          .replace(/\s*-\s*(@PopcornBR)/gi, ' $1')
          .replace(/\s{2,}/g, ' ')
      } while (newCap.match(/\s{2,}|\s*-\s*(@PopcornBR)/gim))

      console.log('descOrig=>', descOrig)
      console.log('newCap  =>', newCap)

      // Reply with video
      let currentChatButtonContent = subtitled
        ? `${newCap.replace('@PopcornBR', ' ').trim()} leg`
        : `${newCap.replace('@PopcornBR', ' ').trim()} `

      ctx.replyWithVideo(fileId,
        Extra.load({caption: newCap,
          reply_to_message_id: ctx.message.message_id})
          .markdown()
          .markup((m) =>
            m.inlineKeyboard(
              [
                m.callbackButton('Apagar', `apagar ${msgReplyedId}`),
                m.switchToCurrentChatButton(
                  'Pesquisar inline',
                  `${currentChatButtonContent}`
                )
              ]
            )
          )
      ).then(({message_id}) => {
        lastMsgId = message_id + 1
      })

      //Pin chat after replied the user and delete system message about it
      await ctx.telegram.pinChatMessage(ctx.chat.id, msgReplyedId)
      await ctx.deleteMessage(lastMsgId)
        .catch(() => {
          // console.log(err)
          ctx.reply('⚠️ Atenção! ⚠️\nTalvez o filme escolhido para edição já tenha sido postado no canal anteriormente. Verifique antes de continuar. Mensagem autodestrutiva 💣')
            .then(({message_id}) => {
              setTimeout(() => {
                ctx.deleteMessage(message_id)
              }, 10 * 1000)
            })
        })
    } else {
      ctx.reply('Não vejo motivos para editar essa mensagem! 💣')
        .then(({message_id}) => {
          setTimeout(() => {
            ctx.deleteMessage(message_id)
          }, 5 * 1000)
        })
    }
  })
}