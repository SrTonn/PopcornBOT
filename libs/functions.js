// const bot = new Telegraf(process.env.BOT_TOKEN)
const LOGGER_GROUP = +process.env.LOGGER_GROUP
const DEV = +process.env.DEVELOPER_ID
const CHANNEL_ID = process.env.CHANNEL_ID
const myChannels = process.env.CHANNEL_LIST

// Encaminha msgs para o grupo de logs do BOT
let logger = async (ctx) => {

  // Verifica se a requisição não está vindo do desenvolvedor
  if (ctx.message && ctx.chat.id !== DEV && ctx.update.message.from.id !== DEV) {

    // Coleta informações sobre o usuário
    let userInfo = await ctx.telegram.getChat(ctx.chat.id)
    console.log(userInfo)

    // Verifica se o usuário tem username
    userInfo.username = userInfo.username == null ? 'N/A' : '@' + userInfo.username

    // Encaminha msg para o grupo logger
    await ctx.telegram.forwardMessage(LOGGER_GROUP, ctx.chat.id, ctx.message.message_id).then(({
      message_id
    }) => {

      // Responde a msg original encaminhada com as informações do usuário -> ID, NAME e USERNAME caso tenha
      ctx.telegram.sendMessage(LOGGER_GROUP,
        `Username: ${userInfo.username}\nName: ${userInfo.first_name}\nID: ${userInfo.id}`, {
          reply_to_message_id: message_id
        })
    })
  }
}

// Verifica se o ID consta na lista de ADMINS do canal
let verificar = async (ctx, next) => {
  let dados = await ctx.telegram.getChatAdministrators(CHANNEL_ID)

  // modo inline - usuários
  if (ctx.update.inline_query &&
    dados.findIndex(a => a.user.id === ctx.update.inline_query.from.id) !== -1) {
    next()

    // modo geral - usuários, grupos e canais
  } else if (
              myChannels.indexOf(ctx.chat.id + '') !== -1 ||
              (ctx.inline_query == null &&
              ctx.chat &&
              dados.findIndex(a => a.user.id === ctx.from.id) !== -1)
    ) {

    next()

    // click em botoes - usuarios
  } else if (ctx.update.callback_query &&
    dados.findIndex(a => a.user.id === ctx.update.callback_query.from.id) !== -1) {

    next()

    // Modo geral para usuários negados
  } else if (ctx.inline_query == null && ctx.update.chosen_inline_result == null) {

    logger(ctx)
    console.log('Usuário sem permissão. ' + ctx.from.id)
  }
}

// Tempo de parada do BOT em 'milliseconds'
let sleep = (milliseconds) => {
  const date = Date.now()
  let currentDate = null
  do {
    currentDate = Date.now()
  } while (currentDate - date < milliseconds)
}

// Compara valores e ordena de forma ascedente
let compareValues = (key, order = 'asc') => {
  return function innerSort(a, b) {
    // eslint-disable-next-line no-prototype-builtins
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {

      // property doesn't exist on either object
      return 0
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key]
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key]

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
let getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

// Atribuir Genero
let atrGenero = (codigo, genero) => {
  switch (codigo) {
    case 28:
      genero = '#Ação '
      break

    case 12:
      genero = '#Aventura '
      break

    case 35:
      genero = '#Comédia '
      break

    case 80:
      genero = '#Crime '
      break

    case 18:
      genero = '#Drama '
      break

    case 10751:
      genero = '#Família '
      break

    case 14:
      genero = '#Fantasia '
      break

    case 37:
      genero = '#Faroeste '
      break

    case 10752:
      genero = '#Guerra '
      break

    case 10762:
      genero = '#Kids '
      break

    case 9648:
      genero = '#Mistério '
      break

    case 10402:
      genero = '#Música '
      break

    case 878:
      genero = '#Scifi '
      break

    case 53:
      genero = '#Suspense '
      break

    case 10764:
      genero = '#Reality '
      break

    case 10749:
      genero = '#Romance '
      break

    case 27:
      genero = '#Terror '
      break

    default:
      break
  }
  return genero
}

// Exporta as funções
module.exports = {
  logger,
  sleep,
  verificar,
  compareValues,
  getRandomInt,
  atrGenero
}