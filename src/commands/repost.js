const bot_uname = process.env.BOT_UNAME

module.exports = bot => {
  bot.on(['channel_post','message'], (ctx, next) => {
  
    // Definição do comando
    let command = ['/repost',`/repost${bot_uname}`]
    
    // Verifica se o texto contém o commando definido acima &&
    // Verifica se o método responder foi utilizado &&
    // Verifica se é post em canal
    if (ctx.update.channel_post != null && (ctx.update.channel_post.text === command[0] || ctx.update.channel_post.text === command[1]) && (ctx.update.channel_post.reply_to_message.video != null || ctx.update.channel_post.reply_to_message.photo != null)) {

      let file_id = ''
      let caption = ctx.update.channel_post.reply_to_message.caption
      let msgId = ctx.update.channel_post.message_id

      if (!ctx.update.channel_post.reply_to_message.photo) {

        file_id = ctx.update.channel_post.reply_to_message.video.file_id
        // console.log('é video:',file_id)
        ctx.replyWithVideo(file_id, {caption: caption})
        ctx.telegram.deleteMessage(ctx.chat.id, msgId)

      } else if (ctx.update.channel_post.reply_to_message.photo) {

        file_id = ctx.update.channel_post.reply_to_message.photo[1].file_id
        // console.log('é photo:',file_id)
        ctx.replyWithPhoto(file_id, {caption: caption})
        ctx.telegram.deleteMessage(ctx.chat.id, msgId)

      }

    // Verifica se o texto contém o commando definido acima &&
    // Verifica se o método responder foi utilizado &&
    // Verifica se é post em chat privado
    // Verifica se a msg é do tipo 'photo' ou 'video'
    } else if (ctx.update.message && ctx.chat.type != 'channel' && (ctx.update.message.text == command[0] || ctx.update.message.text == command[1]) && (ctx.update.message.reply_to_message.video || ctx.update.message.reply_to_message.photo)) {
      console.log('lin 39')
      
      let file_id = ''
      let caption = ctx.message.reply_to_message.caption
      let msgId = ctx.update.message.message_id
      
      // Caso seja vídeo executa esse bloco
      if (ctx.update.message.reply_to_message.video) {
          
        file_id = ctx.update.message.reply_to_message.video.file_id
        ctx.replyWithVideo(file_id, {caption: caption})
        ctx.telegram.deleteMessage(ctx.chat.id, msgId)
          
      // Caso não seja vídeo executa o bloco abaixo
      } else {

        file_id = ctx.update.message.reply_to_message.photo[1].file_id
        // console.log('é photo:',file_id)
        ctx.replyWithPhoto(file_id, {caption: caption})
        ctx.telegram.deleteMessage(ctx.chat.id, msgId)

      }
    }
    next() 
  })
}