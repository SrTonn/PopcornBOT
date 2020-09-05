const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')      
const { enter, leave } = Stage
        
const { sleep, compareValues, getRandomInt } = require('../../libs/functions')
const { optional } = require('telegraf/scenes/base')
const stage = new Stage()

module.exports = bot => {
  let res = ''
  
  bot.use(stage.middleware())
  bot.action('newpost', async (ctx) => {
    await ctx.answerCbQuery()
    // console.log(ctx.update.callback_query.message.message_id)
    
    //Canal ao qual será feito a publicação
    let channelId = process.env.CHANNEL_ID
    try {
      var chatInfo = await bot.telegram.getChat(channelId)
    } catch (error) {
      console.log()
    }
    console.log('Iniciando newpost em', chatInfo.title)
    
    ctx.scene.reset()
    ctx.scene.session = {}
    var dd = ctx.scene.options.sessionName
    ctx[dd].__scenes = {}

    let question0 = new Scene('que 0')
    let question1 = new Scene('que 1')
    let question2 = new Scene('que 2')
    let question3 = new Scene('que 3')
    let question4 = new Scene('que 4')
    let posts = new Array()
    let cover = new Array()
    
    let stage = new Stage([
      question0 ,question1, question2, question3, question4
    ], { ttl: 1200 })
    bot.use(stage.middleware())
    
    // question1 scene
    question1.enter()           
    question1.on(['video'], (ctx) => {
        
      let msgId = ctx.update.message.message_id
      let videoCap = ctx.update.message.caption
      let videoId = ctx.update.message.video.file_id
      let chatId = ctx.chat.id

      let padrao = {
        msgId: msgId,
        videoCap: videoCap,
        videoId: videoId,
        chatId: chatId
      }
      posts.push(padrao)
      // console.log('log push posts >>', posts)
      if (posts.filter(x => x.chatId == ctx.chat.id).length == 21) {
        ctx.reply(
          'Alerta! Número alto de posts detectado, modo seguro(lento) ativado!'
        )
      }
      ctx.scene.enter('que 1')
      
    })
    question1.on(['photo'], ctx => {

      if (cover.findIndex(x => x.chatId === ctx.chat.id) != -1) {
        cover = cover.filter(x => x.chatId !== ctx.chat.id)
      }

      let msgId = ctx.update.message.message_id
      let photoCap = ctx.update.message.caption
      let photoId = ctx.update.message.photo[1].file_id
      let chatId = ctx.chat.id

      let padrao = {
        msgId: msgId,
        photoCap: photoCap,
        photoId: photoId,
        chatId: chatId
      }
      cover.push(padrao)
      
    })
    question1.hears('Done', async ctx => {
      if (posts.map(x => x.chatId).indexOf(ctx.chat.id) != -1) {

        // Filtrar posts repetidos para um novo array
        res = posts.filter((v,i,a)=>a.findIndex(t=>(t.videoCap === v.videoCap))===i)

        // Organizar array
        res.sort(compareValues('videoCap'))
        // console.log('res:', res)
        ctx.scene.enter('que 2')

      } else {
        
        ctx.reply('ERROR nenhum vídeo encontrado!\nEnvie algum arquivo de vídeo para começar.', Extra.markdown().markup(
          Markup.keyboard(['Done','Cancelar']).resize()
        ))
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

    // question2 scene
    question2.enter(async (ctx) => {
      let resumo = ''

      console.log(cover)
      if ( cover.length >= 1 && cover.findIndex(x => x.chatId === ctx.chat.id) != -1) {

        let i = cover.findIndex(x => x.chatId === ctx.chat.id)
        let cover_temporada = ''
        let cover_name = cover[i].photoCap.split(/nome: |\n/i, 2)
        cover_name.shift()

        if (cover[i].photoCap.match(/Temporada/i)) {
          cover_temporada = ' - ' + /\d{1,2}ª\sTemporada/ig.exec(cover[i].photoCap)
        }

        resumo += '\n 📷 '+ cover_name + cover_temporada

      }
      for(let i in res)
      if (ctx.chat.id == res[i].chatId) {
        
        resumo += '\n 📹 '+res[i].videoCap
      }

      let countPost = res.filter(x => x.chatId == ctx.chat.id).length + cover.length
      // console.log('res:',res)
      
      if (countPost <= 20) {

        ctx.reply(`Temos ${countPost} midia(s), escolha o que fazer.\n${resumo}`, Extra.markdown().markup(
          Markup.keyboard(['Enviar','Adicionar Mais','Cancelar']).resize()
        ))

      } else {

        ctx.reply(`Temos ${countPost} midia(s), escolha o que fazer.\n${resumo}`, Extra.markdown().markup(
          Markup.keyboard(['Enviar - modo seguro','Forçar Envio Rápido','Adicionar Mais','Cancelar']).resize()
        ))

      }
    })

    question2.hears('Visualizar', async (ctx) => {
      bot.telegram.sendChatAction(ctx.chat.id, 'upload_video')

      // Quantidade de posts do usuário filtrado por ID
      let countPost = posts.filter(x => x.chatId == ctx.chat.id).length

      for(let i in res)
      if (ctx.chat.id == res[i].chatId) {

        if (i == parseInt(res.length/2) && res.length >= 20) {
          ctx.reply(`*Parte 1 com ${parseInt(res.length/2)} posts* exibido(s), escolha entre uma das opções para prosseguir.`, Extra.markdown().markup(
            Markup.keyboard(['Enviar','Cancelar', 'Adicionar Mais']).resize()
          ))
          break
        }

        await ctx.telegram.sendVideo(res[i].chatId, res[i].videoId, {caption: res[i].videoCap})

        sleep(getRandomInt(600, 1500))

        if (i == parseInt(res.length/2) && res.length >= 20) {
          bot.telegram.sendChatAction(ctx.chat.id, 'typing')
          sleep(getRandomInt(3000, 9000))
        }
      }
      sleep(getRandomInt(1000, 3000))

      // console.log('cont', countPost)
      if (res.length < 20) {
        ctx.reply(`${countPost} posts exibido(s), escolha entre uma das opções para prosseguir.`, Extra.markdown().markup(
          Markup.keyboard(['Enviar','Cancelar', 'Adicionar Mais']).resize()
        ))
      } else {
        ctx.reply(`${countPost} posts exibido(s), escolha entre uma das opções para prosseguir.`, Extra.markdown().markup(
          Markup.keyboard(['Enviar 1ª parte','Cancelar', 'Adicionar Mais']).resize()
        ))
      }
    })


    question2.hears('Adicionar Mais', ctx => {
      ctx.reply('Certo, agora pode enviar mais mídias!\n Ao terminar clique em *done*.', Extra.markdown().markup(
        Markup.keyboard(['Done']).resize()
      ))
      ctx.scene.enter('que 1')
    })

    question2.hears(['Enviar','Forçar Envio Rápido'], ctx => ctx.scene.enter('que 3'))
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

        // Pega o ID da msg do usuário e acrescenta +1 para ter o ID da próxima msg do BOT
        let messageId = ctx.update.message.message_id+1
        ctx.reply('🕐 Enviando...',{
          reply_markup: {remove_keyboard: true}
        })
        bot.telegram.sendChatAction(ctx.chat.id, 'typing')

        console.log('test lin223:',cover.length >= 1 && ctx.chat.id == cover[0].chatId )
        
        // Postar resultado no canal!
        // Se tiver imagem, envia primeiro
        if (cover.findIndex(x => x.chatId === ctx.chat.id) != -1) {
          let i = cover.findIndex(x => x.chatId === ctx.chat.id)
          await ctx.telegram.sendPhoto(channelId, cover[i].photoId, {caption: cover[i].photoCap})
        }

        // Envia todos os vídeos
        for(let i in res)
        if (ctx.chat.id == res[i].chatId) {
          
          if ((i >= 19 && cover.findIndex(x => x.chatId === ctx.chat.id) != -1) || (i >= 20 && cover.findIndex(x => x.chatId === ctx.chat.id) == -1)) break
          await ctx.telegram.sendVideo(channelId, res[i].videoId, {caption: res[i].videoCap})
          sleep(getRandomInt(100, 600))

        }

        // Apagar mensagem 'enviando...'
        await ctx.telegram.deleteMessage(ctx.chat.id, messageId)
        await ctx.reply('Feito!',
          {
            reply_markup: Markup.inlineKeyboard([
              Markup.urlButton(
                `Visualizar Post no Canal.`,
                't.me/'+chatInfo.username
              )
            ])
          }
        )

        ctx.reply('Criar novo post? 👇' ,
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
        )
        ctx.scene.leave()
    })
      
    question4.enter(async (ctx) => {

      // Pega o ID da msg do usuário e acrescenta +1 para ter o ID da próxima msg do BOT
      let messageId = ctx.update.message.message_id+1
      ctx.reply('🕐 Enviando...',{
        reply_markup: {remove_keyboard: true}
      })
      bot.telegram.sendChatAction(ctx.chat.id, 'typing')
      
      // Postar resultado no canal!
      // Se tiver imagem, envia primeiro
      if (cover.findIndex(x => x.chatId === ctx.chat.id) != -1) {
        let i = cover.findIndex(x => x.chatId === ctx.chat.id)
        await ctx.telegram.sendPhoto(channelId, cover[i].photoId, {caption: cover[i].photoCap})
      }

      // Envia todos os vídeos
      for(let i in res)
      if (ctx.chat.id == res[i].chatId) {
        await ctx.telegram.sendVideo(channelId, res[i].videoId, {caption: res[i].videoCap})
        sleep(getRandomInt(1500, 2000))
        if (i >= 15 && i != res.length) {
          sleep(3050)
        }
      }
      
      // Apagar mensagem 'enviando...'
      await ctx.telegram.deleteMessage(ctx.chat.id, messageId)
      await ctx.reply('Feito!',
        {reply_markup: Markup.inlineKeyboard([
          Markup.urlButton(
            `Visualizar Post no Canal.`,
            't.me/'+chatInfo.username
          )
        ]
        )}
      )

      ctx.reply('Criar novo post? 👇' ,
        Markup.inlineKeyboard([
          Markup.callbackButton('Criar Post', 'newpost')
        ]).extra()
      )
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
      
      leave()
    })

    // Scene 0 - Verificar se o usuário já tem dados na memória e limpar
    question0.enter(ctx => {
      // console.log('typeof', typeof(ctx.chat.id))
      
      // console.log('test lin 134', posts.map(x => x.chatId).indexOf(ctx.chat.id) != -1)
      
      // Limpa a let posts baseado no ID do usuário
      if (posts.findIndex(x => x.chatId === ctx.chat.id) != -1) {
        // console.log('posts lin 136', posts)
        
        posts = posts.filter(x => x.chatId !== ctx.chat.id)
        // console.log('posts lin 139', posts)
          
      } 

      // Limpa a let cover baseado no ID do usuário
      if (cover.findIndex(x => x.chatId === ctx.chat.id) != -1) {
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
        Extra.markdown()
        .markup(
          Markup.keyboard([
            'Done',
            'Cancelar'
          ]).resize().oneTime()
        )
      )

      ctx.scene.enter('que 0')
    })
  })
}