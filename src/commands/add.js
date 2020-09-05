const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('data.json')
const db = lowdb(adapter)

const DEV = process.env.DEVELOPER_ID

module.exports = bot => {
  bot.command('add', async ctx => {
    let array = ctx.message.text.split(" ")
    array.shift()
    let newArray = array.join('')
    Number(newArray)
    let dados = db.get("adminList").map('id').value()

    // Verifica se o comando está vindo do DEVELOPER e se o ID já consta na lista
    if (ctx.chat.id == DEV && dados.indexOf(String(newArray)) == -1) {
        let userInfo = await bot.telegram.getChat(newArray)
        db.get("adminList")
          .push({
            id: String(userInfo.id),
            title: userInfo.title,
            first_name: userInfo.first_name,
            username: userInfo.username,
            type: userInfo.type
          }).write()
        if (userInfo.type == 'private') {
          ctx.reply(`Usuário "${userInfo.first_name}" adicionado com sucesso!`)
        } else {
          ctx.reply(`Grupo/Canal "${userInfo.title}" adicionado com sucesso!`)
        }
    } else {
      ctx.reply('ERROR! ID já consta na lista.')
    }
  })
}