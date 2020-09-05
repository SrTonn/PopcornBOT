const BOT_UNAME = process.env.BOT_UNAME

const helpMessage = 
`
/start ou /help Para ver essa mensagem
/newpost Para criar um post novo para o canal
/editar Para editar um post utilizando a função "responder" do telegram (/e/edit)
/repost Para repostar um conteúdo do formato *imagem* ou *vídeo* em um *grupo* ou *canal*
/removekeyboard Para remover os botões de teclado do telegram

Funções Inline
@${BOT_UNAME} + nome do filme (para fazer busca de filmes)
@${BOT_UNAME} + serie + nome da serie (para fazer busca de series)

Para a busca vir com a tag #Legendado basta acrescentar "Leg ou Legendado" ao final da busca.
Ex.:
@${BOT_UNAME} Coringa legendado
@${BOT_UNAME} Série DARK legendado

Caso o filme ou série não seja encontrado, tente buscar o nome original fazendo uma busca através do BOT @IMDb + nome serie/filme
Ex.: @IMDb the good place  _ou_  @IMDb os vingadores
`

module.exports = {
  helpMessage
}