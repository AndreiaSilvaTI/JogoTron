const paletaCoresInimigo = ['#ff3b3b', '#ff3bda', '#9d3bff', '#3bff5b', '#ffee3b', '#ff7b00'];

function gerarCorAleatoria() {
  return paletaCoresInimigo[Math.floor(Math.random() * paletaCoresInimigo.length)];
}

class Inimigo {
  constructor(x, y, cor) {
    this.x = x;
    this.y = y;
    this.tamanho = 20;
    this.velocidade = 250;
    this.cor = cor || '#ff5b3b';
    this.morto = false;
    this.proximoTiroEm = 0;
    this.direcaoAtual = { x: 1, y: 0 };
  }

  atualizar(dt, jogador, mundo, tempoAtual, criarDiscoInimigo) {
    if (this.morto) return;

    const dx = jogador.x - this.x;
    const dy = jogador.y - this.y;
    const distJogador = Math.hypot(dx, dy);

    let dirX = dx / (distJogador || 1);
    let dirY = dy / (distJogador || 1);

    const anguloBase = Math.atan2(dirY, dirX);
    const checarFrente = mundo.colideComParede(
      this.x + Math.cos(anguloBase) * 40,
      this.y + Math.sin(anguloBase) * 40,
      this.tamanho
    );

    if (checarFrente) {
      const esqX = Math.cos(anguloBase - Math.PI / 3);
      const esqY = Math.sin(anguloBase - Math.PI / 3);
      if (!mundo.colideComParede(this.x + esqX * 40, this.y + esqY * 40, this.tamanho)) {
        dirX = esqX;
        dirY = esqY;
      } else {
        dirX = Math.cos(anguloBase + Math.PI / 3);
        dirY = Math.sin(anguloBase + Math.PI / 3);
      }
    }

    this.direcaoAtual = { x: dirX, y: dirY };

    const novoX = this.x + dirX * this.velocidade * dt;
    const novoY = this.y + dirY * this.velocidade * dt;

    if (!mundo.colideComParede(novoX, this.y, this.tamanho)) this.x = novoX;
    if (!mundo.colideComParede(this.x, novoY, this.tamanho)) this.y = novoY;

    if (jogador.estaVivo() && distJogador < this.tamanho + jogador.tamanho) {
      jogador.receberAtaqueInimigo();
    }

    if (jogador.estaVivo() && distJogador < 480 && tempoAtual > this.proximoTiroEm) {
      criarDiscoInimigo(this.x, this.y, dirX, dirY, this.cor);
      this.proximoTiroEm = tempoAtual + 2000 + Math.random() * 500;
    }
  }

  desenhar(ctx, camera) {
    if (this.morto) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);
    const angulo = Math.atan2(this.direcaoAtual.y, this.direcaoAtual.x);
    ctx.rotate(angulo);

    desenharLightCycleTopDown(ctx, this.cor, '#200707', false);

    ctx.restore();
  }
}
