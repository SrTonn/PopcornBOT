const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('data.json')
const db = lowdb(adapter)

// const bot = new Telegraf(process.env.BOT_TOKEN)
const LOGGER_GROUP = process.env.LOGGER_GROUP
const DEV = process.env.DEVELOPER_ID

// Encaminha msgs para o grupo de logs do BOT
let logger = async (ctx) => {
  try {

    // Verifica se a requisição não está vindo do desenvolvedor
    if (ctx.message && ctx.chat.id != DEV && ctx.update.message.from.id != DEV) {

      // Coleta informações sobre o usuário
      let userInfo = await ctx.telegram.getChat(ctx.chat.id)

      // Verifica se o usuário tem username
      if (userInfo.username == null) {

        // Define o username como traço '-'
        userInfo.username = '-'

      } else {

        //add @ antes do username
        userInfo.username = '@'+ userInfo.username

      }

      //Encaminha msg para o grupo logger
      await ctx.telegram.forwardMessage(LOGGER_GROUP, ctx.chat.id , ctx.message.message_id ).then(({ message_id }) => {
          // Responde a msg original encaminhada com as informações do usuário -> ID, NAME e USERNAME caso tenha
          ctx.telegram.sendMessage(LOGGER_GROUP, `\nUsername: ${userInfo.username}\nName: ${userInfo.first_name}\nID: ${userInfo.id}` , {reply_to_message_id: message_id} )
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// Verifica se o ID consta na lista de ADMINS do BOT
let verificar = async (ctx, next) => {
  let dados = db.get("adminList").map('id').value()
  if( ctx.update.inline_query && dados.indexOf(String(ctx.update.inline_query.from.id)) != -1 ) {
    next()
  } else if( ctx.inline_query == undefined && ctx.chat && dados.indexOf(String(ctx.chat.id)) != -1 ) {
    next()
  } else if ( ctx.update.callback_query && dados.indexOf(String(ctx.update.callback_query.from.id)) != -1 ) {
    next()
  } else if ( ctx.inline_query == undefined && ctx.update.chosen_inline_result == undefined ) {
    logger(ctx)
    console.log('Usuário sem permissão.')
  }
}

// Tempo de parada do BOT em 'milliseconds'
let sleep = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

// Compara valores e ordena de forma ascedente
let compareValues = (key, order = 'asc') => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key]
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key]

    let comparison = 0
    if (varA > varB) {
      comparison = 1
    } else if (varA < varB) {
      comparison = -1
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    )
  }
}

// Gera um número aleatório inteiro com valores pré definidos(mínimo, máximo)
let getRandomInt= (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

// Exporta as funções
module.exports = { logger, sleep, verificar, compareValues, getRandomInt }