const axios = require('axios')

const API_TMDB_KEY = process.env.API_TMDB_KEY
const API_TMDB_BASEURL = process.env.API_TMDB_BASEURL
const API_TMDB_BASE_IMG = process.env.API_TMDB_BASE_IMG
const API_TMDB_TAM = process.env.API_TMDB_TAM

var info = new Array()

module.exports = bot => {
  bot.on('inline_query', async (ctx, next) => {
    try {

      //Msg recebida do usuário para efetuar a busca(aceita acentuação)
      let nomeBusca = ctx.inlineQuery.query.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      let descricao = ''
      let userId = ctx.update.inline_query.from.id
      let busca_leg = ['leg','legendado']
      // var info = new Array()
      
      // if¹ - Busca de Séries
      // if² - Busca de Séries por temporada
      // if³ - Busca de Filmes
      if (nomeBusca.match(/^s.rie/i)) {
        let idioma = 'Dublado'
        let categoria = 'Serie'

        let array = nomeBusca.split(" ")
        array.shift()
        
        if (busca_leg.indexOf(array[array.length - 1].toLowerCase()) != -1) {
          idioma = 'Legendado'
          array.pop()
        }
        nomeBusca = array.join(' ')
        // console.log(nomeBusca)
        

        let res = await axios.get(`${API_TMDB_BASEURL}/search/tv/?api_key=${API_TMDB_KEY}&query=${nomeBusca}&language=pt-BR`)
        // console.log(res.data.results)
        let data = res.data.results

        //Filtro para evitar posts sem link da img e sem descrição vindas da API
        let filter = data.filter((item) => item.poster_path != null && item.overview != '')
        // console.log('filter:',filter)

        //Informações a serem gravadas temporariamente no banco de dados
        //São complementos de dados que não vem na busca por ID
        resFilter = filter.map((item, index) => {

            if (idioma == 'Legendado') {
              item.original_language = idioma
            } else if ( (item.original_language == 'pt' || item.original_language == 'pt-BR') && item.origin_country[0] == 'BR') {
              item.original_language = 'Nacional'
            } else if ((item.original_language != 'pt' || item.original_language != 'pt-BR') && item.origin_country[0] != 'BR') {
              item.original_language = 'Dublado'
            }

            return {
              id_tmdb: `${item.id}`,
              name: `${item.name}`,
              original_name: `${item.original_name}`,
              idioma: item.original_language,
              original_language: `${item.original_language}`,
              origin_country: `${String(item.origin_country)}`,
              genre_ids: item.genre_ids,
              descricao: `${item.overview}`
            }
        })

        if (info.findIndex(x => x.ID === String(userId)) != -1) {
          info = info.filter(x => x.ID !== String(userId))
        } 
        info.push({ID: `${userId}`, temp: resFilter})

        // console.log('res:', resFilter)
        
        // console.log('filter:', filter)
        
        var results = filter.map((item, index) => {
          let linkImg = `${API_TMDB_BASE_IMG}${API_TMDB_TAM}${item.poster_path}`
          descricao = item.overview
          let ano = item.first_air_date
          
          //Substutui o formato 0000-00-00 por 0000
          if (ano && ano.match(/(\d{4})-\d{2}-\d{2}/)) {
            let myRegex = /(\d{4})-\d{2}-\d{2}/
            ano = ano.replace(myRegex, '$1')
          }

          //Limite de caracteres na descricao
          if(descricao.length > 800) {
            item.overview = item.overview.substr(0, 600) + '...'
          }

          // Regex para localizar dois pontos ":"
          let doisP = /(?<!(Nome|Original))\:/img

          //Busca dos ":" para substituir por traço "-"
          if( item.name.match(doisP) || item.original_name.match(doisP)) {
            item.name = item.name.replace(doisP, ' -')
            item.original_name = item.original_name.replace(doisP, ' -')
          }

          
          //if - Definir se a série é #Nacional
          if (idioma == 'Legendado') {
            item.original_language = idioma
          } else if ( (item.original_language == 'pt' || item.original_language == 'pt-BR') && item.origin_country[0] == 'BR') {
            item.original_language = 'Nacional'
          } else if ((item.original_language != 'pt' || item.original_language != 'pt-BR') && item.origin_country[0] != 'BR') {
            item.original_language = 'Dublado'
          } 
          // console.log('categoria:', categoria)
          
          //if - Definir se é anime
          //else if - Definir se é animacao
          if (item.genre_ids.indexOf(16) != -1 &&item.original_language == 'ja') {
            categoria = 'Anime'
          } else if (item.genre_ids.indexOf(16) != -1 &&item.original_language != 'ja') {
            categoria = 'Animacao'
          } else if (item.genre_ids.indexOf(99) != -1) {
            categoria = 'Documentario'
          } else {
            categoria = 'Serie'
          }

          //resultado do .map()
          return {
            type: 'photo',
            id: String(index),
            photo_url: `${linkImg}`,
            thumb_url: `${linkImg}`,
            caption: `Nome: ${item.name}\nOriginal: ${item.original_name}\n1ª Temporada\n` +
            `\n#${categoria} #${item.original_language} #y${ano}\n\n` +
            `Descrição: ${item.overview}\n\n@PopcornBR`,
            photo_width: 200,
            photo_height: 300,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: `Pesquisar outras temporadas`, switch_inline_query_current_chat: `${item.id} [${item.name}] (${item.original_name}) `}
                    ]
                ]
            }
          }
        })
      } else if (nomeBusca.match(/^\d+/i)) {
        let array = nomeBusca.split(" ")
        let regName = /\[(.*)\]/i //buscar nome traduzido
        let name = regName.exec(nomeBusca)[1]
        let regOriName = /\((.*)\)/i //buscar nome original
        let original_name = regOriName.exec(nomeBusca)[1]
        let tv_id = array[0]
        let season = array[array.length - 1]
        let categoria = 'Serie'
        let numberId = `${array[0]}`
        
        // busca da API para SÉRIES
        let res = await axios.get(`${API_TMDB_BASEURL}/tv/${tv_id}/season/${season}?api_key=${API_TMDB_KEY}&language=pt-BR`)
        
        let data = res.data
        let ano = data.air_date
        let descricao = data.overview
        let linkImg = `${API_TMDB_BASE_IMG}${API_TMDB_TAM}${data.poster_path}`
        
        let i = info.findIndex(x => x.ID === String(userId))
        
        // busca no banco de dados local p/ complemento de dados
        let _info = info[i].temp.filter(x => x.id_tmdb == numberId)
        // console.log('info lin144:', _info)
        
        // Definindo o idioma de acordo com dado armazenado em _info
        let idioma = _info[0].idioma

        // console.log('_info[0].idioma',_info[0].idioma)
        
        // sobrescrever 'descricao' caso ela venha vazia
        if (descricao.length < 1) {
          descricao = _info[0].descricao
        }

        if(descricao.length > 800) {
          descricao = _info[0].descricao.substr(0, 600) + '...'
        }
        
        if (ano && ano.match(/(\d{4})-\d{2}-\d{2}/mg)) {
          // regex para pegar data completa e substituir pelo ano
          let myRegex = /(\d{4})-\d{2}-\d{2}/
          ano = ano.replace(myRegex, '$1')
        }

        // busca nacionalidade para definir se é serie/animacao/anime e se é #Nacional
        if ((_info[0].original_language == 'pt' || _info[0].original_language == 'pt-BR') && _info[0].origin_country == 'BR') {
          idioma = 'Nacional'
          console.log('lin 187')
            
        } else if (_info[0].genre_ids.indexOf(16) != -1 && _info[0].original_language == 'ja') {
          categoria = 'Anime'
        } else if (_info[0].genre_ids.indexOf(16) != -1 && _info[0].original_language != 'ja') {
          categoria = 'Animacao'
        } else if (_info[0].genre_ids.indexOf(99) != -1) {
          categoria = 'Documentario'
        } else {
          categoria = 'Serie'
        }
        
        //Resultado a ser exibido no modo inline dentro do telegram
        var results = [{
          type: 'photo',
          id: data.id,
          photo_url: `${linkImg}`,
          thumb_url: `${linkImg}`,
          caption: `Nome: ${name}\nOriginal: ${original_name}\n${season}ª Temporada\n` +
          `\n#${categoria} #${idioma} #y${ano}\n\n` +
          `Descrição: ${descricao}\n\n@PopcornBR`,
          photo_height: 300,
          photo_width: 200 
        }]
      } else {
        let idioma = 'Dublado'
        let categoria = 'Filme'

        // Array para verificar se ultima palavra contém a let busca_leg
        let array = nomeBusca.split(' ')
        // Verificando a última palavra do array
        if (busca_leg.indexOf(array[array.length - 1].toLowerCase()) != -1) {
          idioma = 'Legendado'
          array.pop()
        }
        // Retornando resultado para a let nomeBusca
        nomeBusca = array.join(' ')

        //Busca da API do TMDb
        let res = await axios.get(`${API_TMDB_BASEURL}/search/movie/?api_key=${API_TMDB_KEY}&query=${nomeBusca}&language=pt-BR`)
        let data = res.data.results
        console.log('data:',data)
        
        //Filtro para evitar posts sem link de img e sem descricao
        let filter = data.filter((item) => item.poster_path != null && item.overview != '')
        
        var results = filter.map((item, index) => {
          let linkImg = `${API_TMDB_BASE_IMG}${API_TMDB_TAM}${item.poster_path}`
          let descricao = item.overview
          let ano = item.release_date
          if (item.release_date.match(/(\d{4})-\d{2}-\d{2}/mg)) {
            // regex para pegar data completa e substituir pelo ano
            let myRegex = /(\d{4})-\d{2}-\d{2}/
            ano = item.release_date.replace(myRegex, '$1')
          }

          //Limite de caracteres na descricao
          if(descricao.length > 800) {
            item.overview = item.overview.substr(0, 600) + '...'
          }

          
          //if Definir se o filme é #Nacional
          if (idioma == 'Legendado') {
            item.original_language = idioma
          } else if ( item.original_language == 'pt' || item.original_language == 'pt-BR') {
            item.original_language = 'Nacional'
          } else if (item.original_language != 'pt' || item.original_language != 'pt-BR') {
            item.original_language = 'Dublado'
          }
          // console.log(results)

          //if - Definir se é anime
          //else if - Definir se é animacao
          if (item.genre_ids.indexOf(16) != -1 && item.original_language == 'ja') {
            categoria = 'Anime'
          } else if (item.genre_ids.indexOf(16) != -1 && item.original_language != 'ja') {
            categoria = 'Animacao'
          } else if (item.genre_ids.indexOf(99) != -1) {
            categoria = 'Documentario'
          } else if (item.genre_ids.length == 1 && item.genre_ids.indexOf(10402) != -1) {
            categoria = 'Show'
          } /* else if (item.genre_ids.length > 1 && item.genre_ids.indexOf(10402) != -1) {
            categoria = 'Musical'
          }*/ else {
            categoria = 'Filme'
          }
          // console.log(item.genre_ids.length == 1)
          
          // Regex para localizar dois pontos ":"
          let doisP = /(?<!(Nome|Original))\:/img
          if( item.title.match(doisP) || item.original_title.match(doisP)) {
            item.title = item.title.replace(doisP, ' -')
            item.original_title = item.original_title.replace(doisP, ' -')
          }
          
          return {
            type: 'photo',
            id: String(index),
            photo_url: `${linkImg}`,
            thumb_url: `${linkImg}`,
            caption: `Nome: ${item.title}\nOriginal: ${item.original_title}\n` +
            `\n#${categoria} #${item.original_language} #y${ano}\n\n` +
            `Descrição: ${item.overview}\n\n@PopcornBR`,
            photo_width: 200,
            photo_height: 300
          } 
        }) 
      }
      
      // Resultado a ser exibido na tela pro usuário
      await ctx.answerInlineQuery(results)
      console.log('results:', results)
      
      next()
    } catch (error) {
      console.log(error)
    }
  })
}
