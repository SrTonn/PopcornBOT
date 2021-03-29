
const CHANNEL_LIST = process.env.CHANNEL_LIST

module.exports = bot => {
  bot.on(['channel_post'], (ctx, next) => {
    let caption = ctx.update.channel_post.caption || ''

    // index 0 = looking for season + episode = S00E00
    // index 1 = looking for year = 0000 OR quality 720p|1080p
    const regExBusc = [
      /S\d{2}E\d{2}/img,
      /\s?(720p|1080p)\s?|\s?[([]?[12][019]\d{2}(?!p)[)\]]?/img,
    ]

    try {
      var condition = [
        CHANNEL_LIST.indexOf(ctx.chat.id) !== -1,
        !ctx.update.edited_channel_post,
        !ctx.update.channel_post.forward_date,
        !!ctx.update.channel_post.video,
        !!caption.match(regExBusc[0]),
        !!caption.match(regExBusc[1]),
      ]
      
    } catch (error) {
      console.log(error)
    }

    // regex da e edicao
    const regEx = /\s?[([]?[12][019]\d{2}(?!p)[)\]]?|\s?720p|\s?1080p/img
    if (!condition.includes(false)) {

      let descOrig = ctx.update.channel_post.caption // original description
      let cPostId = ctx.update.channel_post.message_id // Channel Post Id
      console.log(descOrig)

      // new description \/
      let newCap = descOrig.split(regEx),
        msg = newCap.join('').replace(/\s{2,}/g, ' ')
      console.log(msg)
      bot.telegram.editMessageCaption(ctx.chat.id, cPostId, cPostId, msg)
    }
    next()
  })
}