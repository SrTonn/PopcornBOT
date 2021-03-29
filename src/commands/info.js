
module.exports = bot => {
  bot.command('info', async ctx => {

    // removing the /info command
    let array = ctx.message.text.split(' ')
    array.shift()

    // newArray without /info command
    let newArray = array.join(''),
      userInfo = await bot.telegram.getChat(newArray)

    // Check if the user has username
    userInfo.username = !userInfo.username ? '-' : '@' + userInfo.username

    // Reply user
    ctx.reply(`ID: ${userInfo.id}\n` +
      `Username: ${userInfo.username}\n` +
      `First_name: ${userInfo.first_name}\n` +
      `type: ${userInfo.type}`
    )
  })
}