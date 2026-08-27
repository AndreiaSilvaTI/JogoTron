class Disco {
  constructor(x, y, dirX, dirY, eDoJogador = true, cor = '#4de3ff') {
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.velocidade = 650;
    this.alcance = 420;
    this.distanciaPercorrida = 0;
    this.retornando = false;
    this.raio = 8;
    this.finalizado = false;
    this.eDoJogador = eDoJogador;
    this.cor = cor;
  }

  atualizar(dt, jogador, inimigos, tempoAtual, mundo, adicionarDestroco) {
    const deslocamento = this.velocidade * dt;

    if (!this.retornando) {
      const nx = this.x + this.dirX * deslocamento;
      const ny = this.y + this.dirY * deslocamento;

      if (mundo.colideComParede(nx, ny, this.raio)) {
        this.retornando = true;
        playLaser();
      } else {
        this.x = nx;
        this.y = ny;
        this.distanciaPercorrida += deslocamento;
        if (this.distanciaPercorrida >= this.alcance) this.retornando = true;
      }
    } else {
      const alvoX = this.eDoJogador ? jogador.x : this.x;
      const alvoY = this.eDoJogador ? jogador.y : this.y;
      const dx = alvoX - this.x;
      const dy = alvoY - this.y;
      const dist = Math.hypot(dx, dy);

      if (this.eDoJogador && dist < 20) {
        this.finalizado = true;
        return;
      }

      if (!this.eDoJogador && this.distanciaPercorrida > this.alcance * 1.8) {
        this.finalizado = true;
        return;
      }

      this.x += (dx / (dist || 1)) * deslocamento;
      this.y += (dy / (dist || 1)) * deslocamento;
    }

    if (this.eDoJogador) {
      for (const inimigo of inimigos) {
        if (inimigo.morto) continue;
        if (Math.hypot(inimigo.x - this.x, inimigo.y - this.y) < this.raio + inimigo.tamanho) {
          inimigo.morto = true;
          playDerez();
          adicionarDestroco(inimigo.x, inimigo.y, inimigo.cor);
          jogador.ganharVida(25);
          this.finalizado = true;
          break;
        }
      }
    } else {
      if (jogador.estaVivo() && Math.hypot(jogador.x - this.x, jogador.y - this.y) < this.raio + jogador.tamanho) {
        jogador.receberAtaqueInimigo();
        this.finalizado = true;
      }
    }
  }

  desenhar(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    ctx.save();
    ctx.fillStyle = this.cor;
    ctx.beginPath();
    ctx.arc(sx, sy, this.raio, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class RastroLuz {
  constructor() {
    this.pontos = [];
    this.duracaoMs = 2600;
    this.distanciaMinima = 8;
  }

  registrarPonto(x, y, tempoAtual) {
    const ultimo = this.pontos[this.pontos.length - 1];
    if (!ultimo || Math.hypot(x - ultimo.x, y - ultimo.y) >= this.distanciaMinima) {
      this.pontos.push({ x, y, criadoEm: tempoAtual });
    }
  }

  atualizar(tempoAtual) {
    while (this.pontos.length && tempoAtual - this.pontos[0].criadoEm > this.duracaoMs) {
      this.pontos.shift();
    }
  }

  verificarColisoes(inimigos, jogador, adicionarDestroco) {
    for (const inimigo of inimigos) {
      if (inimigo.morto) continue;
      for (const ponto of this.pontos) {
        if (Math.hypot(inimigo.x - ponto.x, inimigo.y - ponto.y) < inimigo.tamanho + 5) {
          inimigo.morto = true;
          playDerez();
          adicionarDestroco(inimigo.x, inimigo.y, inimigo.cor);
          jogador.ganharVida(25);
          break;
        }
      }
    }
  }

  desenhar(ctx, camera, tempoAtual) {
    if (this.pontos.length < 2) return;
    ctx.save();

    ctx.strokeStyle = 'rgba(77, 227, 255, 0.4)';
    ctx.lineWidth = 12;

    for (let i = 1; i < this.pontos.length; i++) {
      const p1 = this.pontos[i - 1];
      const p2 = this.pontos[i];
      const idade = (tempoAtual - p2.criadoEm) / this.duracaoMs;
      ctx.globalAlpha = Math.max(0, 1 - idade);
      ctx.beginPath();
      ctx.moveTo(p1.x - camera.x, p1.y - camera.y);
      ctx.lineTo(p2.x - camera.x, p2.y - camera.y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    for (let i = 1; i < this.pontos.length; i++) {
      const p1 = this.pontos[i - 1];
      const p2 = this.pontos[i];
      const idade = (tempoAtual - p2.criadoEm) / this.duracaoMs;
      ctx.globalAlpha = Math.max(0, 1 - idade);
      ctx.beginPath();
      ctx.moveTo(p1.x - camera.x, p1.y - camera.y);
      ctx.lineTo(p2.x - camera.x, p2.y - camera.y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
