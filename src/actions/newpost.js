const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const {leave} = Stage

const { sleep, compareValues, getRandomInt } = require('../functions/functions')

// const { optional } = require('telegraf/scenes/base')
const stage = new Stage()

module.exports = bot => {
  // let hasUserName = false
  let res = ''

  bot.use(stage.middleware())
  bot.action('newpost', async (ctx) => {
    await ctx.answerCbQuery()

    // Canal ao qual será feito a publicação
    let channelId = process.env.CHANNEL_ID
    try {
      var chatInfo = await bot.telegram.getChat(channelId)
    } catch (error) {
      console.log(error)
    }
    console.log('Iniciando newpost em', chatInfo.title)
    // hasUserName = chatInfo.username || true

    ctx.scene.reset()
    ctx.scene.session = {}
    var dd = ctx.scene.options.sessionName
    ctx[dd].__scenes = {}

    let // questions scene
      question0 = new Scene('que 0'),
      question1 = new Scene('que 1'),
      question2 = new Scene('que 2'),
      question3 = new Scene('que 3'),
      question4 = new Scene('que 4'),
      posts = new Array(),
      cover = new Array(),

      // Stage
      stage = new Stage([
        question0, question1, question2, question3, question4
      ], { ttl: 1200 })
    bot.use(stage.middleware())

    // question1 scene
    question1.enter()
    question1.on(['video'], (ctx) => {

      let msgId = ctx.update.message.message_id,
        videoCap = ctx.update.message.caption,
        videoId = ctx.update.message.video.file_id,
        chatId = ctx.chat.id
      videoCap = videoCap
        .replace(/T(\d{2}E\d{2})/g, 'S$1')
        .replace(/\s+-?\s+(@PopcornBR)/i, ' $1')

      // Modelo padrão para armazenar os dados em um objeto
      let padrao = {
        msgId: msgId,
        videoCap: videoCap,
        videoId: videoId,
        chatId: chatId
      }
      posts.push(padrao)

      if (posts.filter(x => x.chatId === ctx.chat.id).length === 21) {
        ctx.reply(
          'Alerta! Número alto de posts detectado, modo seguro(lento) ativado!'
        )
      }
      ctx.scene.enter('que 1')

    })
    question1.on(['photo'], ctx => {

      if (cover.findIndex(x => x.chatId === ctx.chat.id) !== -1) {
        cover = cover.filter(x => x.chatId !== ctx.chat.id)
      }

      let msgId = ctx.update.message.message_id,
        photoCap = ctx.update.message.caption,
        photoId = ctx.update.message.photo[1].file_id,
        chatId = ctx.chat.id,
        padrao = {
          msgId: msgId,
          photoCap: photoCap,
          photoId: photoId,
          chatId: chatId
        }
      cover.push(padrao)

    })
    question1.hears('Done', async ctx => {
      if (posts.map(x => x.chatId).indexOf(ctx.chat.id) !== -1) {

        // Filtrar posts repetidos para um novo array
        res = posts.filter((v, i, a)=>a.findIndex(t=>(t.videoCap === v.videoCap)) === i)

        // Organizar array
        res.sort(compareValues('videoCap'))
        ctx.scene.enter('que 2')

      } else {

        ctx.reply('ERROR nenhum vídeo encontrado!\nEnvie algum arquivo de vídeo para começar.',
          Extra
            .markdown()
            .markup(
              Markup.keyboard(['Done', 'Cancelar'])
                .resize()
            )
        )
        ctx.scene.enter('que 1')

      }
    })
    question1.hears('Cancelar', async ctx => {
      await ctx.reply('A criação do post foi cancelada.', {
        reply_markup: {remove_keyboard: true}
      })
      await ctx.reply('Aqui você pode criar postagens relevantes.',
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
      )

      leave()
    })
    question1.hears(['Forçar','forced','fsend','fs'], ctx => {
      posts = ''
      ctx.scene.enter('que 3')
    })

    // question2 scene
    question2.enter(async (ctx) => {
      let resumo = ''
      if (cover.length >= 1 && cover.findIndex(x => x.chatId === ctx.chat.id) !== -1) {

        let cover_temporada = '',
          i = cover.findIndex(x => x.chatId === ctx.chat.id),
          cover_name = cover[i].photoCap.split(/nome: |\n/i, 2)
        cover_name.shift()

        if (cover[i].photoCap.match(/Temporada/i)) {
          cover_temporada = ' - ' + /\d{1,2}ª\sTemporada/ig.exec(cover[i].photoCap)
        }

        resumo += '\n 📷 ' + cover_name + cover_temporada

      }
      for (let i in res)

        if (ctx.chat.id === res[i].chatId) {
          resumo += '\n 📹 ' + res[i].videoCap
        }

      let countPost = res.filter(x => x.chatId === ctx.chat.id).length + cover.length
      if (countPost <= 20) {
        ctx.reply(`Temos ${countPost} midia(s), escolha o que fazer.\n${resumo}`,
          Extra
            .markdown()
            .markup(
              Markup.keyboard(['Enviar', 'Adicionar Mais', 'Cancelar'])
                .resize()
            )
        )
      } else {
        ctx.reply(`Temos ${countPost} midia(s), escolha o que fazer.\n${resumo}`,
          Extra
            .markdown()
            .markup(
              Markup.keyboard([
                'Enviar - modo seguro',
                'Forçar Envio Rápido',
                'Adicionar Mais',
                'Cancelar'
              ]).resize()
            )
        )
      }
    })

    question2.hears('Visualizar', async (ctx) => {
      bot.telegram.sendChatAction(ctx.chat.id, 'upload_video')

      // Quantidade de posts do usuário filtrado por ID
      let countPost = posts.filter(x => x.chatId === ctx.chat.id).length

      for (let i in res)
        if (ctx.chat.id === res[i].chatId) {

          if (i === parseInt(res.length / 2) && res.length >= 20) {
            ctx.reply(`*Parte 1 com ${parseInt(res.length / 2)} posts* exibido(s),` +
          'escolha entre uma das opções para prosseguir.',
            Extra.markdown().markup(
              Markup.keyboard(['Enviar', 'Cancelar', 'Adicionar Mais'])
                .resize()
            )
            )
            break
          }

          await ctx.telegram.sendVideo(res[i].chatId, res[i].videoId, {caption: res[i].videoCap})

          sleep(getRandomInt(600, 1500))

          if (i === parseInt(res.length / 2) && res.length >= 20) {
            bot.telegram.sendChatAction(ctx.chat.id, 'typing')
            sleep(getRandomInt(3000, 9000))
          }
        }
      sleep(getRandomInt(1000, 3000))

      if (res.length < 20) {
        ctx.reply(`${countPost} posts exibido(s), escolha entre uma das opções para prosseguir.`,
          Extra.markdown().markup(
            Markup.keyboard(['Enviar', 'Cancelar', 'Adicionar Mais']).resize()
          ))
      } else {
        ctx.reply(`${countPost} posts exibido(s), escolha entre uma das opções para prosseguir.`,
          Extra
            .markdown()
            .markup(
              Markup.keyboard(['Enviar 1ª parte', 'Cancelar', 'Adicionar Mais'])
                .resize()
            )
        )
      }
    })

    question2.hears('Adicionar Mais', ctx => {
      ctx.reply('Certo, agora pode enviar mais mídias!\n Ao terminar clique em *done*.',
        Extra
          .markdown()
          .markup(
            Markup.keyboard(['Done'])
              .resize()
          )
      )
      ctx.scene.enter('que 1')
    })

    question2.hears(['Enviar', 'Forçar Envio Rápido'], ctx => ctx.scene.enter('que 3'))
    question2.hears('Enviar - modo seguro', ctx => ctx.scene.enter('que 4'))
    question2.hears('Cancelar', async ctx => {
      await ctx.reply('A criação do post foi cancelada.', {
        reply_markup: {remove_keyboard: true}
      })
      await ctx.reply('Aqui você pode criar postagens relevantes.',
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
      )

      leave()
    })

    // question3 scene
    question3.enter(async (ctx) => {

      let messageId = ''
      await ctx.reply('Preparando...', {
        reply_markup: {remove_keyboard: true}
      }).then(({message_id}) => {
        messageId = message_id
      })

      bot.telegram.sendChatAction(ctx.chat.id, 'typing')

      // Postar resultado no canal!
      // Se tiver imagem, envia primeiro
      console.log('lin278')
      if (cover.findIndex(x => x.chatId === ctx.chat.id) !== -1) {
        let i = cover.findIndex(x => x.chatId === ctx.chat.id)
        await ctx.telegram.sendPhoto(channelId, cover[i].photoId, 
          {
            caption: cover[i].photoCap,
          }
        )
      }
      
      await ctx.reply('Enviando...')
      await ctx.telegram.deleteMessage(ctx.chat.id, messageId)
      messageId++
      console.log('res.length',res.length)
      // Envia todos os vídeos no modo rápido
      for (let i in res)
        if (ctx.chat.id === res[i].chatId) {
          let x = i * 100 / res.length
          console.log('x=>',x,'i=>',i)
          if ((i >= 19 && cover.findIndex(x => x.chatId === ctx.chat.id) !== -1) ||
          (i >= 20 && cover.findIndex(x => x.chatId === ctx.chat.id) === -1)) break

          await ctx.telegram.sendVideo(channelId, res[i].videoId,
            {
              caption: res[i].videoCap
            }
          )

          if (i % 2 == 0) {
            await bot.telegram.editMessageText(
              ctx.chat.id, 
              messageId, 
              messageId, 
              `${parseInt(x)}% concluído.`
            )
          }
          sleep(getRandomInt(100, 600))
        }

      // Editar msg avisando que o post foi concluído.
      await bot.telegram.editMessageText(
        ctx.chat.id, 
        messageId, 
        messageId, 
        '100% concluído.',
        {reply_markup: Markup.inlineKeyboard([
          Markup.urlButton(
            'Visualizar Post no Canal.',
            't.me/c/' + String(channelId).slice(4) + '/99999'
          )
        ]
        )}
      )

      ctx.reply('Criar novo post? 👇',
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
      ).then(({message_id}) => {
        ctx.telegram.pinChatMessage(ctx.chat.id, message_id)
      })
      ctx.scene.leave()
    })

    question4.enter(async (ctx) => {

      // Pega o ID da msg do usuário e acrescenta +1 para ter o ID da próxima msg do BOT
      let messageId = ''
      await ctx.reply('Preparando post.', {
        reply_markup: {remove_keyboard: true}
      }).then(({message_id}) => {
        messageId = message_id
      })
      bot.telegram.sendChatAction(ctx.chat.id, 'typing')


      await ctx.reply('Enviando...')
      await ctx.telegram.deleteMessage(ctx.chat.id, messageId)
      messageId++

      // Postar resultado no canal!
      // Se tiver imagem, envia primeiro
      if (cover.findIndex(x => x.chatId === ctx.chat.id) !== -1) {
        let i = cover.findIndex(x => x.chatId === ctx.chat.id)
        await ctx.telegram.sendPhoto(channelId, cover[i].photoId, {caption: cover[i].photoCap})
      }

      // Envia todos os vídeos no modo seguro
      for (let i in res)
        if (ctx.chat.id === res[i].chatId) {
          await ctx.telegram.sendVideo(channelId, res[i].videoId, {caption: res[i].videoCap})
          sleep(getRandomInt(1600, 2000))
          if (i >= 15 && i !== res.length) {
            sleep(3050)
          }

          let x = i * 100 / res.length

          if (i % 2 == 0) {
            await bot.telegram.editMessageText(
              ctx.chat.id, 
              messageId, 
              messageId, 
              `${parseInt(x)}% concluído.`
            )
          }
        }

      // Editar msg avisando que o post foi concluído.
      await bot.telegram.editMessageText(
        ctx.chat.id, 
        messageId, 
        messageId, 
        '100% concluído.',
        {reply_markup: Markup.inlineKeyboard([
          Markup.urlButton(
            'Visualizar Post no Canal.',
            't.me/c/' + String(channelId).slice(4) + '/99999'
          )
        ]
        )}
      )

      ctx.reply('Criar novo post? 👇',
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
      ).then(({message_id}) => {
        ctx.telegram.pinChatMessage(ctx.chat.id, message_id)
      })
      ctx.scene.leave()
    })

    question4.hears('Cancelar', async ctx => {
      await ctx.reply('A criação do post foi cancelada.', {
        reply_markup: {remove_keyboard: true}
      })
      await ctx.reply('Aqui você pode criar postagens relevantes.',
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
      )

      ctx.scene.leave()
    })

    // Scene 0 - Verificar se o usuário já tem dados na memória e limpar
    question0.enter(ctx => {

      // Limpa a let posts baseado no ID do usuário
      if (posts.findIndex(x => x.chatId === ctx.chat.id) !== -1) {
        posts = posts.filter(x => x.chatId !== ctx.chat.id)
      }

      // Limpa a let cover baseado no ID do usuário
      if (cover.findIndex(x => x.chatId === ctx.chat.id) !== -1) {
        cover = cover.filter(x => x.chatId !== ctx.chat.id)
      }

      ctx.scene.enter('que 1')
    })

    await bot.telegram.editMessageText(
      ctx.chat.id,
      ctx.update.callback_query.message.message_id,
      ctx.update.callback_query.id,
      'Selecione o *Canal*.',
      Extra.markdown()
        .markup((m) =>
          m.inlineKeyboard([
            m.callbackButton(chatInfo.title, chatInfo.id)])
        )
    )

    // parte destinado a criar a capa do post futuramente
    bot.action(channelId, async (ctx) => {
      await ctx.deleteMessage()
      await ctx.reply('Agora envie um ou mais vídeos, quando concluir clique em *done*',
        Extra
          .markdown()
          .markup(
            Markup.keyboard([
              'Done',
              'Cancelar'
            ])
              .resize()
              .oneTime()
          )
      )
      ctx.scene.enter('que 0')
    })
  })
}