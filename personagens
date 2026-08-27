function desenharMotoDespedacada(ctx, corNeon) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 5, 5, 0.7)';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111';
  ctx.strokeStyle = corNeon;
  ctx.lineWidth = 1.5;
  ctx.fillRect(8, -12, 10, 14);
  ctx.strokeRect(8, -12, 10, 14);

  ctx.fillStyle = corNeon;
  ctx.fillRect(-12, -14, 4, 4);
  ctx.fillRect(10, 8, 5, 4);
  ctx.fillRect(-6, 12, 4, 4);

  ctx.restore();
}

function desenharLightCycleTopDown(ctx, corNeon, escuroPneu, destruida = false) {
  if (destruida) {
    desenharMotoDespedacada(ctx, corNeon);
    return;
  }

  ctx.save();
  ctx.fillStyle = escuroPneu;
  ctx.fillRect(14, -9, 14, 18);
  ctx.strokeStyle = corNeon;
  ctx.lineWidth = 2;
  ctx.strokeRect(14, -9, 14, 18);

  ctx.fillStyle = escuroPneu;
  ctx.fillRect(-26, -10, 16, 20);
  ctx.strokeRect(-26, -10, 16, 20);

  ctx.fillStyle = '#050a12';
  ctx.beginPath();
  ctx.moveTo(20, -7);
  ctx.lineTo(8, -12);
  ctx.lineTo(-18, -12);
  ctx.lineTo(-24, -8);
  ctx.lineTo(-24, 8);
  ctx.lineTo(-18, 12);
  ctx.lineTo(8, 12);
  ctx.lineTo(20, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#020408';
  ctx.beginPath();
  ctx.arc(-2, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = corNeon;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-5, -6);
  ctx.lineTo(5, -9);
  ctx.lineTo(14, -7);
  ctx.moveTo(-5, 6);
  ctx.lineTo(5, 9);
  ctx.lineTo(14, 7);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(18, -2, 5, 4);

  ctx.restore();
}

class Destroco {
  constructor(x, y, cor) {
    this.x = x;
    this.y = y;
    this.cor = cor;
    this.angulo = Math.random() * Math.PI * 2;
  }
  desenhar(ctx, camera) {
    ctx.save();
    ctx.translate(this.x - camera.x, this.y - camera.y);
    ctx.rotate(this.angulo);
    desenharMotoDespedacada(ctx, this.cor);
    ctx.restore();
  }
}

class Jogador {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 22;

    this.vidaMax = 100;
    this.vida = this.vidaMax;
    this.energiaMax = 100;
    this.energia = this.energiaMax;

    this.velocidade = 450;
    this.direcao = { x: 1, y: 0 };
    this.cor = '#4de3ff';
    this.destruido = false;
    this.emMovimento = false;
  }

  atualizar(dt, input, mundo) {
    if (this.destruido) {
      updateMotoAudio(false);
      return;
    }

    let dx = 0, dy = 0;
    if (input.cima) dy -= 1;
    if (input.baixo) dy += 1;
    if (input.esquerda) dx -= 1;
    if (input.direita) dx += 1;

    this.emMovimento = (dx !== 0 || dy !== 0);
    updateMotoAudio(this.emMovimento);

    if (this.emMovimento) {
      const comp = Math.hypot(dx, dy);
      dx /= comp;
      dy /= comp;
      this.direcao = { x: dx, y: dy };

      const novoX = this.x + dx * this.velocidade * dt;
      const novoY = this.y + dy * this.velocidade * dt;

      if (!mundo.colideComParede(novoX, this.y, this.tamanho)) this.x = novoX;
      if (!mundo.colideComParede(this.x, novoY, this.tamanho)) this.y = novoY;
    }

    this.energia = Math.min(this.energiaMax, this.energia + 25 * dt);

    this.x = Math.max(this.tamanho, Math.min(mundo.largura - this.tamanho, this.x));
    this.y = Math.max(this.tamanho, Math.min(mundo.altura - this.tamanho, this.y));
  }

  podeArremessarDisco() { return !this.destruido && this.energia >= 30; }

  receberAtaqueInimigo() {
    if (this.destruido) return;
    playLaser();
    this.energia = 0;
    this.vida -= 40;
    if (this.vida <= 0) {
      this.vida = 0;
      this.destruir();
    }
  }

  destruir() {
    if (this.destruido) return;
    playDerez();
    stopMotoAudioInstant();
    this.vida = 0;
    this.energia = 0;
    this.destruido = true;
  }

  ganharVida(quantidade) {
    if (this.destruido) return;
    this.vida = Math.min(this.vidaMax, this.vida + quantidade);
  }

  estaVivo() { return !this.destruido && this.vida > 0; }

  desenhar(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);
    const angulo = Math.atan2(this.direcao.y, this.direcao.x);
    ctx.rotate(angulo);

    desenharLightCycleTopDown(ctx, this.cor, '#071624', this.destruido);

    ctx.restore();
  }
}
