/* ============================================================
   INTERFACE.JS — Menus, HUD e telas (não contém lógica de jogo)
   ============================================================ */

const Interface = {
  elementos: {},

  /** Deve ser chamado uma vez, quando a página carrega */
  inicializar() {
    this.elementos.telaMenu = document.getElementById('tela-menu');
    this.elementos.telaDerrota = document.getElementById('tela-derrota');
    this.elementos.btnIniciar = document.getElementById('btn-iniciar');
    this.elementos.btnReiniciar = document.getElementById('btn-reiniciar');
    this.elementos.barraVida = document.getElementById('barra-vida');
    this.elementos.barraEnergia = document.getElementById('barra-energia');
    this.elementos.hudModoTexto = document.getElementById('hud-modo-texto');
  },

  /** Conecta os botões de menu às funções de callback do game.js */
  configurarBotoes(aoIniciar, aoReiniciar) {
    this.elementos.btnIniciar.addEventListener('click', aoIniciar);
    this.elementos.btnReiniciar.addEventListener('click', aoReiniciar);
  },

  esconderMenu() {
    this.elementos.telaMenu.classList.add('escondido');
  },

  mostrarDerrota() {
    this.elementos.telaDerrota.classList.remove('escondido');
  },

  esconderDerrota() {
    this.elementos.telaDerrota.classList.add('escondido');
  },

  /** Atualiza as barras do HUD com os valores atuais do jogador */
  atualizarHUD(jogador) {
    const pctVida = Math.max(0, jogador.vida / jogador.vidaMax) * 100;
    const pctEnergia = Math.max(0, jogador.energia / jogador.energiaMax) * 100;
    this.elementos.barraVida.style.width = pctVida + '%';
    this.elementos.barraEnergia.style.width = pctEnergia + '%';
    this.elementos.hudModoTexto.textContent = jogador.naLightCycle ? 'LIGHT CYCLE' : 'A PÉ';
  }
};
