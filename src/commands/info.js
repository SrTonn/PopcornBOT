
module.exports = bot => {
  bot.command('info', async ctx => {

    // Removendo o comando inicial /info
    let array = ctx.message.text.split(" ")
    array.shift()

    // Nova let sem o comando inicial /info
    let newArray = array.join('')
    Number(newArray)

    let userInfo = await bot.telegram.getChat(newArray)
    
    // Verifica se o usuário tem username
    if (userInfo.username == null) {
      userInfo.username = '-'
    } else {
      userInfo.username = '@'+ userInfo.username
    }

    // Responde usuário
    ctx.reply(`ID: ${userInfo.id}\n` +
      `Username: ${userInfo.username}\n` +
      `First_name: ${userInfo.first_name}\n` +
      `type: ${userInfo.type}`
    )
    
  })
}