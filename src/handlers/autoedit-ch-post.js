const CHANNEL_LIST = process.env.CHANNEL_LIST

module.exports = bot => {
  bot.on(['channel_post', 'message'], (ctx, next) => {

    // regex da busca
    const regExBusc = /S\d{2}E\d{2}(\s?720p|\s?1080p)/img

    // regex da e edicao
    const regEx = /\s?[([]?[12][019]\d{2}(?!p)[)\]]?|\s?720p|\s?1080p/img

    console.log(CHANNEL_LIST[0])
    console.log(typeof(ctx.chat.id))
    if (((CHANNEL_LIST.indexOf(ctx.chat.id) !== -1)
      && ctx.update.edited_channel_post == null)
      && ctx.update.channel_post.forward_date == null
      && (ctx.update.channel_post.video || ctx.update.channel_post.reply_to_message)) {

      if (ctx.update.channel_post.video
        && ctx.update.channel_post.caption
        && ctx.update.channel_post.caption.match(regExBusc)) {

        let descOrig = ctx.update.channel_post.caption // descricao original
        let cPostId = ctx.update.channel_post.message_id // Channel Post Id
        console.log(descOrig)

        // nova descricao \/
        let newCap = descOrig.split(regEx),
         msg = newCap.join('')
        console.log(msg)
        bot.telegram.editMessageCaption(ctx.chat.id, cPostId, cPostId, msg)
      }
    }
    next()
  })
}