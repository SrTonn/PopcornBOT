const BOT_UNAME = '@' + process.env.BOT_UNAME

module.exports = bot => {
  bot.on(['channel_post', 'message'], async (ctx, next) => {

    // Definição do comando utilizado
    let command = ['/repost', `/repost${BOT_UNAME}`]
    try {
      var channelConditionArray = ctx.chat.type === 'channel' ?
        [
          ctx.update.channel_post,
          ctx.update.channel_post.text === command[0],
          !!ctx.update.channel_post.reply_to_message.video ||
          !!ctx.update.channel_post.reply_to_message.photo
        ] : [false]

      var privateConditionArray = ctx.chat.type !== 'channel' ?
        [
          ctx.chat.type !== 'channel',
          ctx.update.message.text === command[0] ||
          ctx.update.message.text === command[1],
          !!ctx.update.message.reply_to_message.video ||
          !!ctx.update.message.reply_to_message.photo
        ] : [false]

      // Verifica se o texto contém o commando definido acima &&
      // Verifica se o método responder foi utilizado &&
      // Verifica se é post em canal
      if (!channelConditionArray.includes((false))) {
  
        let msgId = ctx.update.channel_post.message_id,
          caption = ctx.update.channel_post.reply_to_message.caption,
          file_id = ctx.update.channel_post.reply_to_message.video ?
            ctx.update.channel_post.reply_to_message.video.file_id :
            ctx.update.channel_post.reply_to_message.photo[1].file_id
  
        console.log(file_id)
        console.log(file_id.length)
        caption = file_id.length === 75 ? 
          caption.replace(/\s+-?\s+(@PopcornBR)/i, ' $1') :
          caption
  
        ctx.update.channel_post.reply_to_message.video ?
          ctx.replyWithVideo(file_id, {caption: caption}) :
          ctx.replyWithPhoto(file_id, {caption: caption})
        ctx.telegram.deleteMessage(ctx.chat.id, msgId)
  
        // Verifica se o texto contém o commando definido acima &&
        // Verifica se o método responder foi utilizado &&
        // Verifica se é post em chat privado
        // Verifica se a msg é do tipo 'photo' ou 'video'
      } else if (!privateConditionArray.includes((false))) {
  
        let msgId = ctx.update.message.message_id,
          caption = ctx.message.reply_to_message.caption,
          file_id = ctx.update.message.reply_to_message.video ?
            ctx.update.message.reply_to_message.video.file_id :
            ctx.update.message.reply_to_message.photo[1].file_id
  
        console.log('private IF')
        console.log(file_id)
        console.log(file_id.length)
        caption = file_id.length >= 70 && file_id.length <= 80 ? 
          caption.replace(/\s+-?\s+(@PopcornBR)/i, ' $1') :
          caption
        
        // Verifica o tipo e envia o comando conforme o resultado da condição
        ctx.update.message.reply_to_message.video ?
          ctx.replyWithVideo(file_id, {caption: caption}) :
          ctx.replyWithPhoto(file_id, {caption: caption})
        ctx.telegram.deleteMessage(ctx.chat.id, msgId)
      }
    } catch (error) {
      
      // console.log(error)
    }
    next()
  })
}