/* ============================================================
   PERSONAGENS.JS — Jogador e Inimigos (Programas corrompidos)
   ============================================================ */

/* ---------------------- JOGADOR ---------------------- */
class Jogador {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 22;

    // Atributos
    this.vidaMax = 100;
    this.vida = this.vidaMax;
    this.energiaMax = 100;
    this.energia = this.energiaMax;

    // Movimento
    this.velocidadePe = 220;       // px/s a pé
    this.velocidadeCiclo = 480;    // px/s na Light Cycle
    this.direcao = { x: 0, y: -1 }; // para onde está "olhando" (usado no disco)

    // Estados
    this.naLightCycle = false;
    this.invencivelAte = 0; // timestamp: pequeno período de invencibilidade após tomar dano

    this.cor = '#4de3ff';
  }

  get velocidadeAtual() {
    return this.naLightCycle ? this.velocidadeCiclo : this.velocidadePe;
  }

  /** Atualiza posição, energia e direção com base no input */
  atualizar(dt, input, mundo, tempoAtual) {
    let dx = 0, dy = 0;
    if (input.cima) dy -= 1;
    if (input.baixo) dy += 1;
    if (input.esquerda) dx -= 1;
    if (input.direita) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const comprimento = Math.hypot(dx, dy);
      dx /= comprimento;
      dy /= comprimento;
      this.direcao = { x: dx, y: dy };

      const novoX = this.x + dx * this.velocidadeAtual * dt;
      const novoY = this.y + dy * this.velocidadeAtual * dt;

      if (!mundo.colideComParede(novoX, this.y, this.tamanho)) this.x = novoX;
      if (!mundo.colideComParede(this.x, novoY, this.tamanho)) this.y = novoY;
    }

    // Regeneração de energia: mais rápida a pé, consumida na Light Cycle
    if (this.naLightCycle) {
      this.energia = Math.max(0, this.energia - 14 * dt);
      if (this.energia <= 0) this.naLightCycle = false; // sem energia, desmonta
    } else {
      this.energia = Math.min(this.energiaMax, this.energia + 8 * dt);
    }

    // Limites do mundo
    this.x = Math.max(this.tamanho, Math.min(mundo.largura - this.tamanho, this.x));
    this.y = Math.max(this.tamanho, Math.min(mundo.altura - this.tamanho, this.y));
  }

  alternarLightCycle() {
    if (this.naLightCycle) {
      this.naLightCycle = false;
    } else if (this.energia > 15) {
      this.naLightCycle = true;
    }
  }

  podeArremessarDisco(tempoAtual) {
    return this.energia >= 20;
  }

  receberDano(quantidade, tempoAtual) {
    if (tempoAtual < this.invencivelAte) return; // ainda invencível
    this.vida = Math.max(0, this.vida - quantidade);
    this.invencivelAte = tempoAtual + 600; // meio segundo de invencibilidade
  }

  estaVivo() {
    return this.vida > 0;
  }

  desenhar(ctx, camera, tempoAtual) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Pisca durante invencibilidade
    if (tempoAtual < this.invencivelAte && Math.floor(tempoAtual / 80) % 2 === 0) return;

    ctx.save();
    ctx.translate(sx, sy);

    if (this.naLightCycle) {
      // Corpo da Light Cycle (retângulo alongado na direção do movimento)
      const angulo = Math.atan2(this.direcao.y, this.direcao.x);
      ctx.rotate(angulo);
      ctx.fillStyle = '#0a1620';
      ctx.strokeStyle = this.cor;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.cor;
      ctx.shadowBlur = 14;
      ctx.fillRect(-24, -10, 48, 20);
      ctx.strokeRect(-24, -10, 48, 20);
    } else {
      // Corpo do Programa (círculo com contorno neon)
      ctx.fillStyle = '#0a1620';
      ctx.strokeStyle = this.cor;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.cor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, this.tamanho, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Indicador de direção
      ctx.beginPath();
      ctx.moveTo(this.direcao.x * this.tamanho, this.direcao.y * this.tamanho);
      ctx.lineTo(this.direcao.x * (this.tamanho + 8), this.direcao.y * (this.tamanho + 8));
      ctx.stroke();
    }

    ctx.restore();
  }
}

/* ---------------------- INIMIGO ---------------------- */
class Inimigo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 18;
    this.vidaMax = 40;
    this.vida = this.vidaMax;
    this.velocidade = 110;
    this.danoContato = 8;
    this.raioPercepcao = 260;
    this.cor = '#ff5b3b';
    this.morto = false;

    // Movimento de vagar quando não percebe o jogador
    this.direcaoVagar = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
    this.trocaDirecaoEm = 0;
  }

  atualizar(dt, jogador, mundo, tempoAtual) {
    const distJogador = Math.hypot(jogador.x - this.x, jogador.y - this.y);
    let dx = 0, dy = 0;

    if (distJogador < this.raioPercepcao) {
      // Persegue o jogador
      dx = (jogador.x - this.x) / distJogador;
      dy = (jogador.y - this.y) / distJogador;
    } else {
      // Vaga aleatoriamente
      if (tempoAtual > this.trocaDirecaoEm) {
        this.direcaoVagar = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.trocaDirecaoEm = tempoAtual + 1500 + Math.random() * 1500;
      }
      const comp = Math.hypot(this.direcaoVagar.x, this.direcaoVagar.y) || 1;
      dx = this.direcaoVagar.x / comp;
      dy = this.direcaoVagar.y / comp;
    }

    const novoX = this.x + dx * this.velocidade * dt;
    const novoY = this.y + dy * this.velocidade * dt;
    if (!mundo.colideComParede(novoX, this.y, this.tamanho)) this.x = novoX;
    if (!mundo.colideComParede(this.x, novoY, this.tamanho)) this.y = novoY;

    // Dano por contato direto com o jogador
    if (distJogador < this.tamanho + jogador.tamanho) {
      jogador.receberDano(this.danoContato, tempoAtual);
    }
  }

  receberDano(quantidade) {
    this.vida -= quantidade;
    if (this.vida <= 0) this.morto = true;
  }

  desenhar(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = '#1a0a0a';
    ctx.strokeStyle = this.cor;
    ctx.lineWidth = 2;
    ctx.shadowColor = this.cor;
    ctx.shadowBlur = 10;

    // Corpo em losango (visual distinto do jogador)
    ctx.beginPath();
    ctx.moveTo(0, -this.tamanho);
    ctx.lineTo(this.tamanho, 0);
    ctx.lineTo(0, this.tamanho);
    ctx.lineTo(-this.tamanho, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Barra de vida pequena acima do inimigo
    const largura = 30;
    const pct = Math.max(0, this.vida / this.vidaMax);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx - largura / 2, sy - this.tamanho - 12, largura, 4);
    ctx.fillStyle = this.cor;
    ctx.fillRect(sx - largura / 2, sy - this.tamanho - 12, largura * pct, 4);
  }
}
