const Mundo = {
  largura: 3400,
  altura: 3400,
  tamanhoQuarteirao: 280,
  larguraRua: 160,
  paredes: [],
  predios: [],
  portal: { x: 3100, y: 3100, raio: 110 },

  gerarCidade() {
    this.paredes = [];
    this.predios = [];
    const passo = this.tamanhoQuarteirao + this.larguraRua;
    const espessuraBorda = 60;

    this.paredes.push({ x: 0, y: 0, largura: this.largura, altura: espessuraBorda });
    this.paredes.push({ x: 0, y: this.altura - espessuraBorda, largura: this.largura, altura: espessuraBorda });
    this.paredes.push({ x: 0, y: 0, largura: espessuraBorda, altura: this.altura });
    this.paredes.push({ x: this.largura - espessuraBorda, y: 0, largura: espessuraBorda, altura: this.altura });

    for (let x = this.larguraRua; x < this.largura - this.tamanhoQuarteirao; x += passo) {
      for (let y = this.larguraRua; y < this.altura - this.tamanhoQuarteirao; y += passo) {
        if (Math.abs(x - 300) < 200 && Math.abs(y - 300) < 200) continue;
        if (Math.hypot(x - this.portal.x, y - this.portal.y) < 450) continue;

        this.paredes.push({
          x: x,
          y: y,
          largura: this.tamanhoQuarteirao,
          altura: this.tamanhoQuarteirao
        });

        const janelas = [];
        for (let c = 0; c < 4; c++) {
          for (let l = 0; l < 4; l++) {
            janelas.push({
              relX: 40 + c * 54,
              relY: 40 + l * 54,
              ativa: Math.random() > 0.3
            });
          }
        }

        this.predios.push({
          x: x,
          y: y,
          w: this.tamanhoQuarteirao,
          h: this.tamanhoQuarteirao,
          corBorda: Math.random() > 0.5 ? '#ff9331' : '#0f7a99',
          janelas: janelas
        });
      }
    }
  },

  colideComParede(x, y, raio) {
    for (const p of this.paredes) {
      if (x + raio > p.x && x - raio < p.x + p.largura &&
          y + raio > p.y && y - raio < p.y + p.altura) {
        return true;
      }
    }
    return false;
  },

  desenhar(ctx, camera, tempoAtual) {
    ctx.save();
    const minX = Math.max(0, -camera.x);
    const minY = Math.max(0, -camera.y);
    const maxX = Math.min(canvas.width, this.largura - camera.x);
    const maxY = Math.min(canvas.height, this.altura - camera.y);

    ctx.beginPath();
    ctx.rect(minX, minY, maxX - minX, maxY - minY);
    ctx.clip(); 

    ctx.strokeStyle = 'rgba(15, 122, 153, 0.25)';
    ctx.lineWidth = 1;
    const celula = 80;
    const inicioX = Math.floor(camera.x / celula) * celula;
    const inicioY = Math.floor(camera.y / celula) * celula;

    for (let x = inicioX; x < camera.x + canvas.width + celula; x += celula) {
      ctx.beginPath();
      ctx.moveTo(x - camera.x, 0);
      ctx.lineTo(x - camera.x, canvas.height);
      ctx.stroke();
    }
    for (let y = inicioY; y < camera.y + canvas.height + celula; y += celula) {
      ctx.beginPath();
      ctx.moveTo(0, y - camera.y);
      ctx.lineTo(canvas.width, y - camera.y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#ff3b3b';
    ctx.lineWidth = 6;
    ctx.strokeRect(30 - camera.x, 30 - camera.y, this.largura - 60, this.altura - 60);
    ctx.restore();

    for (const predio of this.predios) {
      const sx = predio.x - camera.x;
      const sy = predio.y - camera.y;
      if (sx + predio.w < 0 || sx > canvas.width || sy + predio.h < 0 || sy > canvas.height) continue;

      ctx.fillStyle = '#030812';
      ctx.strokeStyle = predio.corBorda;
      ctx.lineWidth = 2;
      ctx.fillRect(sx, sy, predio.w, predio.h);
      ctx.strokeRect(sx, sy, predio.w, predio.h);

      for (const j of predio.janelas) {
        if (j.ativa) {
          ctx.fillStyle = predio.corBorda === '#ff9331' ? 'rgba(255, 147, 49, 0.6)' : 'rgba(77, 227, 255, 0.6)';
          ctx.fillRect(sx + j.relX, sy + j.relY, 22, 22);
        }
      }
    }

    const psx = this.portal.x - camera.x;
    const psy = this.portal.y - camera.y;
    
    ctx.save();
    ctx.translate(psx, psy);

    const feixeGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 200);
    feixeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    feixeGrad.addColorStop(0.3, 'rgba(94, 244, 255, 0.7)');
    feixeGrad.addColorStop(0.7, 'rgba(15, 122, 153, 0.25)');
    feixeGrad.addColorStop(1, 'rgba(3, 7, 16, 0)');

    ctx.fillStyle = feixeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 200, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5ef4ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.portal.raio + Math.sin(tempoAtual * 0.005) * 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
