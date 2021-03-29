module.exports = bot => {
  bot.command('removekeyboard', async(ctx) => {
    let msgId = ctx.message.message_id
    await bot.telegram.sendMessage(ctx.chat.id, 'Done!',
      {
        reply_markup: {remove_keyboard: true
        }
      }).then(({ message_id }) => {
      setTimeout(() => ctx.deleteMessage(message_id),
        1 * 1000)
      console.log(`message_id ${message_id} deleted`)
    })
    await bot.telegram.deleteMessage(ctx.chat.id, msgId)
  })

  bot.hears('Remove Keyboard', async(ctx) => {
    let msgId = ctx.message.message_id
    await bot.telegram.sendMessage(ctx.chat.id, 'Done!',
      {
        reply_markup: {remove_keyboard: true
        }
      }).then(({ message_id }) => {
      setTimeout(() => ctx.deleteMessage(message_id),
        1 * 1000)
      console.log(`message_id ${message_id} deleted`)
    })
    await bot.telegram.deleteMessage(ctx.chat.id, msgId)
  })
}
