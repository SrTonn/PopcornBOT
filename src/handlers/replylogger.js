/* eslint-disable no-case-declarations */
const LOGGER_GROUP = +process.env.LOGGER_GROUP

module.exports = bot => {
  bot.on('message', (ctx, next) => {

    /* Verifica se a requisição é do chat 'LOGGER_GROUP'
    e se está utilizando o método "responder" do telegram */
    if (
      ctx.chat.id === LOGGER_GROUP &&
      ctx.message.reply_to_message &&
      !ctx.message.reply_to_message.forward_sender_name
    ) {

      // ID de uma msg do tipo encaminhada e respondida no chat logger
      let userId = ctx.message.reply_to_message.text.split(' ')[3]
      let msg = ctx.message.text
      let descricao = ctx.message.caption

      // Chamando a função messageTypeandAnswear()
      // eslint-disable-next-line no-use-before-define
      messageTypeandAnswear(bot, userId, msg, descricao)
      ctx.reply('Resposta enviada!')
    } else if (ctx.chat.id === LOGGER_GROUP &&
                ctx.message.reply_to_message &&
                ctx.message.reply_to_message.forward_sender_name
    ) {
      ctx.reply('Erro ao responder:\nResponda a uma mensagem do BOT que contenha um ID!')
    }

    function messageTypeandAnswear(bot, userId, msg, descricao) {

      // Switch para verificar o tipo da mensagem e responder o usuário
      switch (ctx.updateSubTypes[0].toString()) {
        case 'dice':
          if (ctx.message.dice && ctx.message.dice.emoji === '🏀') {
            bot.telegram.sendDice(userId, {
              emoji: '🏀'
            })
          } else if (ctx.message.dice && ctx.message.dice.emoji === '🎲') {
            bot.telegram.sendDice(userId, {
              emoji: '🎲'
            })
          } else if (ctx.message.dice && ctx.message.dice.emoji === '🎯') {
            bot.telegram.sendDice(userId, {
              emoji: '🎯'
            })
          }
          break
        case 'text':
          bot.telegram.sendMessage(userId, msg)
          break
        case 'video':
          let vidId = ctx.message.video.file_id
          bot.telegram.sendVideo(userId, vidId, {
            caption: descricao
          })
          break
        case 'photo':
          let photoId = ctx.message.photo[2].file_id
          bot.telegram.sendPhoto(userId, photoId, {
            caption: descricao
          })
          break
        case 'sticker':
          let stickerId = ctx.message.sticker.file_id
          bot.telegram.sendSticker(userId, stickerId)
          break
        case 'voice':
          let voiceId = ctx.message.voice.file_id
          bot.telegram.sendVoice(userId, voiceId)
          break
        case 'audio':
          let audioId = ctx.message.audio.file_id
          bot.telegram.sendAudio(userId, audioId, {
            caption: descricao
          })
          break
        case 'animation':
          let gifId = ctx.message.animation.file_id
          bot.telegram.sendAnimation(userId, gifId)
          break
        default:
          break
      }
    }
    next()
  })
}