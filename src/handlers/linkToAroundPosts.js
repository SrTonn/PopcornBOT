const {markdown} = require('telegraf/extra')

module.exports = bot => {
  bot.on('channel_post', (ctx, next) => {
    //filter index 0 = command ADD
    //filter index 1 = command REM
    let regexfilter = [/add\s(<|>)\shttps:\/\/t.me\/(c\/)?.*\/\d+/ig,
      /rem\s(<|>)\shttps:\/\/t.me\/(c\/)?.*\/\d+/ig
    ]
    let text = ctx.update.channel_post.text
  
    try {
  
      var condition = text &&
        ctx.update.channel_post.reply_to_message &&
        ctx.update.channel_post.reply_to_message.photo &&
        ctx.update.channel_post.reply_to_message.caption &&
        ctx.update.channel_post.reply_to_message.caption.match(/@PopcornBR/ig) ?
        true : false
      // console.log('condition',condition)
    } catch (error) {
      console.log(error)
    }
    // console.log(ctx.update.channel_post.reply_to_message)
  
    if (condition && text.match(regexfilter[0])) {
  
      let chatId = ctx.update.channel_post.reply_to_message.chat.id
      let msgIdOriginalPost = ctx.update.channel_post.reply_to_message.message_id
      // let idNewMessage = ctx.update.channel_post.messsage_id
      let oldCaptionArray = ctx.update.channel_post.reply_to_message.caption.split('\n')
      oldCaptionArray.pop()
  
      let link = []
      // let divisorSymbols = /[~|\-&+]/g
      let textArray = text.replace('add', '').trim().split(' ')
      link.push(textArray[1])
      let newCaption = oldCaptionArray.join('\n')
      let leftSide = textArray[0] === '<' ? true : false
      let rightSide = textArray[2] === '>' ? true : false
      let bothSides = leftSide && rightSide ? true : false
      let arrows = ['«-', '-»']
      console.log('hey')
      if (bothSides) {
        link.push(textArray[3])
        console.log('condition1')
        ctx.telegram.editMessageCaption(chatId,
          msgIdOriginalPost,
          msgIdOriginalPost,
          newCaption +
          `\n[${arrows[0]}](${link[0]}) @PopcornBR ` +
          `[${arrows[1]}](${link[1]})`,
          markdown()
        )
      } else if (leftSide) {
        ctx.telegram.editMessageCaption(chatId,
          msgIdOriginalPost,
          msgIdOriginalPost,
          newCaption +
          `\n[${arrows[0]}](${link[0]}) @PopcornBR`,
          markdown()
        )
      } else {
        ctx.telegram.editMessageCaption(chatId,
          msgIdOriginalPost,
          msgIdOriginalPost,
          newCaption +
          `\n@PopcornBR [${arrows[1]}](${link[0]})`,
          markdown()
        )
      }
    }
    next()
  })
}