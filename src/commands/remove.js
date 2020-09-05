const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('data.json')
const db = lowdb(adapter)

const DEV = process.env.DEVELOPER_ID

module.exports = bot => {
  bot.command('remove', async ctx => {
    let dados = db.get("adminList").map('id').value()
    let array = ctx.message.text.split(" ")
    array.shift()
    let newArray = array.join('')
    let userInfo = await bot.telegram.getChat(newArray)
    
    // Verifica se o comando está vindo do DEVELOPER e se o ID já consta na lista
    if (ctx.chat.id == DEV && dados.indexOf(String(newArray)) != -1) {
      db.get("adminList")
        .remove({ id: `${String(newArray)}` })
        .write()
      if (userInfo.type == 'private') {
        ctx.reply(`Usuário "${userInfo.first_name}" removido com sucesso!`)
      } else {
        ctx.reply(`Grupo/Canal "${userInfo.title}" removido com sucesso!`)
      }
    } else {
      ctx.reply('ERROR! ID não consta na lista.')
    }
  })
}