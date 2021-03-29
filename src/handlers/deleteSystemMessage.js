module.exports = bot => {
  bot.on(['pinned_message','new_chat_title'], ctx => {
    ctx.deleteMessage().catch(()=>{})
  })
}