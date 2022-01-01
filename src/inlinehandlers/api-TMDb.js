'use strict'

const {
  atrGenero
} = require('../functions/functions')
const axios = require('axios')

const API_TMDB_KEY = process.env.API_TMDB_KEY
const API_TMDB_BASEURL = process.env.API_TMDB_BASEURL
const API_TMDB_BASE_IMG = process.env.API_TMDB_BASE_IMG
const API_TMDB_TAM = process.env.API_TMDB_TAM

var info = new Array()

module.exports = bot => {
  bot.on('inline_query', async (ctx, next) => {
    let descricao = ''
    let results = ''
    let busca_leg = ['leg', 'legendado']
    let userId = ctx.update.inline_query.from.id
    let lowQuality = false

    // Msg recebida do usuário para efetuar a busca(aceita acentuação)
    let nomeBusca = ctx.inlineQuery.query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    // if¹ - Busca de Séries
    // if² - Busca de Séries por temporada
    // if³ - Busca de Filmes
    if (nomeBusca.match(/^s.rie/i)) {
      let idioma = 'Dublado'
      let categoria = 'Série'
      let genero = ''
      let array = nomeBusca.split(' ')
      array.shift()

      // Verificando a última palavra do array
      let {
        legendado,
        newLowQuality,
        newArray
      } = checkIfLastWordIsLegOrLow(busca_leg, array, 'low')

      // Define se a série é Legendada ou dublada
      idioma = legendado ? 'Legendado' : idioma

      // Define a qualidade da imagem a ser exibida na resposta da Query do telegram
      lowQuality = newLowQuality

      // Retornando resultado para a let nomeBusca
      newArray = newArray || array
      nomeBusca = newArray.join(' ').replace(/\s/g, '%20')

      let res = ''
      try {
        // eslint-disable-next-line max-len
        res = await axios.get(`${API_TMDB_BASEURL}/search/tv/?api_key=` +
          `${API_TMDB_KEY}&query=${nomeBusca}&language=pt-BR`)

      } catch (error) {
        // console.log(error)
      }

      let data = res.data.results

      let filter = data.filter((item) => !!item.poster_path &&
        item.overview)
      // Filtro para evitar posts sem link da img e sem descrição vindas da API
      // let filter = data.filter((item) => !!item.poster_path &&
      //   item.overview !== '')
      // Informações a serem gravadas temporariamente na memória
      // São complementos de dados que não vem na busca por ID
      let resFilter = filter.map((item) => {

        if (idioma === 'Legendado') {

          item.original_language = idioma
        } else if ((item.original_language === 'pt'
                 || item.original_language === 'pt-BR')
                 && item.origin_country[0] === 'BR'
        ) {

          item.original_language = 'Nacional'
        } else if ((item.original_language !== 'pt'
                 || item.original_language !== 'pt-BR')
                 && item.origin_country[0] !== 'BR'
        ) {

          item.original_language = 'Dublado'
        }

        return {
          id_tmdb: `${item.id}`,
          name: `${item.name}`,
          original_name: `${item.original_name}`,
          idioma: item.original_language,
          original_language: `${item.original_language}`,
          origin_country: `${item.origin_country}`,
          genre_ids: item.genre_ids,
          genero: `${genero}`,
          descricao: `${item.overview}`,
          poster_path: `${item.poster_path}`
        }
      })

      info.findIndex(x => x.ID === String(userId)) !== -1 ?
        info = info.filter(x => x.ID !== String(userId)) : null

      info.push({
        ID: `${userId}`,
        temp: resFilter
      })

      results = filter.map((item, index) => {
        genero = ''
        descricao = item.overview
        let ano = item.first_air_date,
          linkImg = `${API_TMDB_BASE_IMG}${API_TMDB_TAM}${item.poster_path}`

        // Substutui o formato 0000-00-00 por 0000
        if (ano && ano.match(/(\d{4})-\d{2}-\d{2}/)) {
          let myRegex = /(\d{4})-\d{2}-\d{2}/
          ano = ano.replace(myRegex, '$1')
        }

        // Limite de caracteres na descricao da série
        while (descricao.length > 700 || descricao.match(/(?:Dr|Sr)a?\.$/i)) {

          item.overview = item.overview.substr(0, item.overview.lastIndexOf('. ') + 1)
          descricao = item.overview
        }

        // Regex para localizar dois pontos ":"
        let doisP = /(?<!(Nome|Original)):/img

        // Busca dos ":" para substituir por traço "-"
        if (item.name.match(doisP) || item.original_name.match(doisP)) {
          item.name = item.name.replace(doisP, ' -')
          item.original_name = item.original_name.replace(doisP, ' -')
        }

        // if - Definir se a série é #Nacional
        if (idioma === 'Legendado') {
          item.original_language = idioma
        } else if ((item.original_language === 'pt' || item.original_language === 'pt-BR') &&
          item.origin_country[0] === 'BR') {
          item.original_language = 'Nacional'
        } else if ((item.original_language !== 'pt' || item.original_language !== 'pt-BR') &&
          item.origin_country[0] !== 'BR') {
          item.original_language = 'Dublado'
        }

        // if - Definir se é anime
        // else if - Definir se é animacao
        if (item.genre_ids.includes(16) && item.original_language === 'ja') {
          categoria = 'Anime'
        } else if (item.genre_ids.includes(16) && item.original_language !== 'ja') {
          categoria = 'Animação'
        } else if (item.genre_ids.includes(99)) {
          categoria = 'Documentário'
        } else {
          categoria = 'Série'
        }

        // definir os generos das séries
        if (item.genre_ids.includes(10765)) {
          item.genre_ids.splice(item.genre_ids.includes(10765), 1)
          item.genre_ids.push(14, 878)
        }
        if (item.genre_ids.includes(10759)) {
          item.genre_ids.splice(item.genre_ids.includes(10759), 1)
          item.genre_ids.push(28, 12)
        }

        // eslint-disable-next-line semi-spacing
        for (let i = 0; i < item.genre_ids.length; i++) {
          let codigo = item.genre_ids[i]
          genero += atrGenero(codigo)
        }

        // remove undefined e organiza as tags por ordem alfabética
        genero = genero.split(/undefined|\s/i).sort(function (a, b) {
          return a.localeCompare(b)
        })

        // Enquanto o array 0 estiver vazio, delete o primeiro array
        while (genero[0] === '') {
          genero.shift()
        }
        genero = genero.join(' ')

        // Quebra linha após add os generos
        if (genero.length > 1) {
          genero += '\n'
        }

        // resultado do .map()
        return {
          type: 'photo',
          id: String(index),
          photo_url: `${linkImg}`,
          thumb_url: `${linkImg}`,
          caption: `Nome: ${item.name}\nOriginal: ${item.original_name}\n1ª Temporada\n` +
            `\n#${categoria} #${item.original_language} #y${ano}\n` +
            `${genero}\n` +
            `Descrição: ${item.overview}\n\n@PopcornBR`,
          photo_width: 200,
          photo_height: 300,
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Pesquisar outras temporadas',
                switch_inline_query_current_chat: `ID${item.id} [${item.name}] (${item.original_name}) `
              }]
            ]
          }
        }
      })

    } else if (nomeBusca.match(/^ID\d+\d+/i)) {
      let array = nomeBusca.split(' ')
      let tv_id = array[0].slice(2)
      let season = array[array.length - 1]
      let categoria = 'Série'
      let numberId = array[0].slice(2)
      let res = ''

      try {
        // busca da API para SÉRIES
        res = await axios.get(`${API_TMDB_BASEURL}/tv/${tv_id}` +
          `/season/${season}?api_key=` +
          `${API_TMDB_KEY}&language=pt-BR`)
      } catch (error) {
        // console.log(error)
      }

      let data = res.data
      let ano = data.air_date
      let descricao = data.overview
      let i = info.findIndex(x => x.ID === String(userId))

      // busca no banco de dados local p/ complemento de dados
      let _info = await info[i].temp.filter(x => x.id_tmdb === numberId)
      let name = _info[0].name,
        original_name = _info[0].original_name,
        genero = ''

      // Se a temporada vier sem poster, buscar poster armazenado na memória
      if (!data.poster_path) {
        data.poster_path = _info[0].poster_path
      }
      let linkImg = `${API_TMDB_BASE_IMG}${API_TMDB_TAM}${data.poster_path}`

      // Definindo o idioma de acordo com dado armazenado em _info
      let idioma = _info[0].idioma

      // sobrescrever 'descricao' caso ela venha vazia
      if (descricao.length < 1) {
        descricao = _info[0].descricao
      }

      // Se a descrição da temporada for maior a 800 caracteres
      // procura pelo ponto "." anterior no texto e remove tudo após o ponto
      while (descricao.length > 700 || descricao.match(/(?:Dr|Sr)a?\.$/i)) {

        descricao = descricao.substr(0, descricao.lastIndexOf('. ') + 1)
      }

      // Busca de ano do formato 0000-00-00 e substitui para 0000
      if (ano && ano.match(/(\d{4})-\d{2}-\d{2}/mg)) {

        // regex para pegar data completa e substituir pelo ano
        let myRegex = /(\d{4})-\d{2}-\d{2}/
        ano = ano.replace(myRegex, '$1')
      }

      // Regex para localizar dois pontos ":"
      let doisP = /(?<!(Nome|Original)):/img

      // Busca dos ":" para substituir por traço "-"
      if (name.match(doisP) || original_name.match(doisP)) {
        name = name.replace(doisP, ' -')
        original_name = original_name.replace(doisP, ' -')
      }

      // busca nacionalidade para definir se é série/animacao/anime e se é #Nacional
      if ((_info[0].original_language === 'pt' || _info[0].original_language === 'pt-BR') &&
        _info[0].origin_country === 'BR') {
        idioma = 'Nacional'
      } else if (_info[0].genre_ids.includes(16) && _info[0].original_language === 'ja') {
        categoria = 'Anime'
      } else if (_info[0].genre_ids.includes(16) && _info[0].original_language !== 'ja') {
        categoria = 'Animação'
      } else if (_info[0].genre_ids.includes(99)) {
        categoria = 'Documentário'
      } else {
        categoria = 'Série'
      }

      // definir os generos das séries - dentro de temporadas
      for (let i = 0; i < _info[0].genre_ids.length; i++) {
        let codigo = _info[0].genre_ids[i]
        genero += atrGenero(codigo)
      }

      // remove undefined e organiza as tags por ordem alfabética
      genero = genero.split(/undefined|\s/i).sort(function (a, b) {
        return a.localeCompare(b)
      })
      while (genero[0] === '') {
        genero.shift()
      }
      genero = genero.join(' ')

      // Quebra linha após add os generos
      if (genero.length > 1) {
        genero += '\n'
      }

      // Resultado a ser exibido no modo inline dentro do telegram
      results = [{
        type: 'photo',
        id: data.id,
        photo_url: `${linkImg}`,
        thumb_url: `${linkImg}`,
        caption: `Nome: ${name}\nOriginal: ${original_name}\n${season}ª Temporada\n` +
          `\n#${categoria} #${idioma} #y${ano}\n` +
          `${genero}\n` +
          `Descrição: ${descricao}\n\n@PopcornBR`,
        photo_height: 300,
        photo_width: 200
      }]
    } else {
      let idioma = 'Dublado'
      let categoria = 'Filme'
      let res = ''

      // Array para verificar se ultima palavra contém a let busca_leg
      let array = nomeBusca.split(' ')

      // Verificando a última palavra do array
      let {
        legendado,
        newLowQuality,
        newArray
      } = checkIfLastWordIsLegOrLow(busca_leg, array, 'low')

      // Define se a série é Legendada ou dublada
      idioma = legendado ? 'Legendado' : idioma

      // Define a qualidade da imagem a ser exibida na resposta da Query do telegram
      lowQuality = newLowQuality

      // Retornando resultado para a let nomeBusca
      newArray = newArray || array
      nomeBusca = newArray.join(' ').replace(/\s/g, '%20')

      let data = ''
      // Busca da API do TMDb para filmes
      res = await axios.get(
        `${API_TMDB_BASEURL}/search/movie` +
        `/?api_key=${API_TMDB_KEY}&query=` +
        `${nomeBusca}&language=pt-BR`
      )

      data = res.data.results

      // Filtro para evitar posts sem link de img e sem descricao
      let filter = data.filter((item) => !!item.poster_path && item.overview !== '')

      results = filter.map((item, index) => {
        let genero = '',
          descricao = item.overview,
          ano = item.release_date,
          linkImg = `${API_TMDB_BASE_IMG}${API_TMDB_TAM}${item.poster_path}`

        if (item.release_date && item.release_date.match(/(\d{4})-\d{2}-\d{2}/mg)) {

          // regex para pegar data completa e substituir pelo ano
          let myRegex = /(\d{4})-\d{2}-\d{2}/
          ano = item.release_date.replace(myRegex, '$1')
        } else {
          ano = '0000'
        }

        // Remove quebra de linhas se houver
        if (descricao.match(/\r/img)) {
          descricao = descricao.replace(/\r/img, '')
        }

        // Limite de caracteres na descricao do filme
        while (descricao.length > 700 || descricao.match(/(?:Dr|Sr)a?\.$/i)) {

          descricao = descricao.substr(0, descricao.lastIndexOf('. ') + 1)
        }

        // if - Definir se é anime
        // else if - Definir se é animacao
        if (item.genre_ids.includes(16) && item.original_language === 'ja') {
          categoria = 'Anime'
        } else if (item.genre_ids.includes(16) && item.original_language !== 'ja') {
          categoria = 'Animação'
        } else if (item.genre_ids.includes(99)) {
          categoria = 'Documentário'
        } else if (item.genre_ids.length === 1 && item.genre_ids.includes(10402)) {
          categoria = 'Show'
        } else {
          categoria = 'Filme'
        }

        // if Definir se o filme é #Nacional
        if (idioma === 'Legendado') {
          item.original_language = idioma
        } else if (item.original_language === 'pt' || item.original_language === 'pt-BR') {
          item.original_language = 'Nacional'
        } else if (item.original_language !== 'pt' || item.original_language !== 'pt-BR') {
          item.original_language = 'Dublado'
        }

        // definir os generos dos filmes
        // eslint-disable-next-line semi-spacing
        for (let i = 0; i < item.genre_ids.length; i++) {
          let codigo = item.genre_ids[i]
          genero += atrGenero(codigo)
        }

        // remove undefined e organiza as tags por ordem alfabética
        genero = genero.split(/undefined|\s/i).sort(function (a, b) {
          return a.localeCompare(b)
        })
        while (genero[0] === '') {
          genero.shift()
        }
        genero = genero.join(' ')

        // Quebra linha após add os generos
        if (genero.length > 1) {
          genero += '\n'
        }

        // Regex para localizar dois pontos ":"
        let doisP = /(?<!(Nome|Original)):/img
        if (item.title.match(doisP) || item.original_title.match(doisP)) {
          item.title = item.title.replace(doisP, ' -')
          item.original_title = item.original_title.replace(doisP, ' -')
        }

        return {
          type: 'photo',
          id: String(index),
          photo_url: `${linkImg}`,
          thumb_url: `${linkImg}`,
          caption: `Nome: ${item.title}\nOriginal: ${item.original_title}\n` +
            `\n#${categoria} #${item.original_language} #y${ano}\n` +
            `${genero}\n` +
            `Descrição: ${descricao}\n\n@PopcornBR`,
          photo_width: 200,
          photo_height: 300
        }
      })
    }

    if (lowQuality === true) {
      for (let i = 0; i < results.length; i++) {
        results[i].photo_url = results[i].photo_url.replace(/\/w500\//gmi, '/w300/')
      }
    }

    await ctx.answerInlineQuery(results)
    next()


    function checkIfLastWordIsLegOrLow(arrayLeg, strInput, arrayLow = undefined) {

      let str = strInput
      let test = []
      if (arrayLow) {
        test = arrayLeg.concat(arrayLow)
      } else {
        test = [...arrayLeg]
      }

      if (!test.includes(str[str.length - 1])) {
        return false
      }

      let legendado = false
      let lowQuality = false

      do {
        if (arrayLeg.indexOf(str[str.length - 1].toLowerCase()) !== -1) {
          legendado = true
        } else {

          if (str[str.length - 1].toLowerCase() === arrayLow) {
            lowQuality = true
          }
        }
        str.pop()
      } while (test.includes(str[str.length - 1].toLowerCase()))

      return {
        legendado: legendado,
        newLowQuality: lowQuality,
        newArray: str
      }
    }
  })
}