# Tron: O Jogo

<img width="60" height="60" alt="Capa do Jogo" src="https://github.com/user-attachments/assets/c68090a8-06fb-4cbd-8bcd-ada39090e647" />

Desenvolvimento de aplicativo de jogo para a disciplina de  TES786205 - Topicos Especiais, semestre 2026.02.

Equipe: ANDREIA CRISTINA DA SILVA e  FERNANDA MATTOS VIEIRA

# TRON // GRID CITY COMBAT

Projeto de jogo 2D desenvolvido em HTML5 Canvas e JavaScript modularizado, inspirado no universo de **TRON**. O jogador controla um *Light Cycle* em uma cidade em malha (Grid), enfrentando inimigos e utilizando discos e rastros de luz para alcançar o portal de fuga.

---

## Tecnologias Utilizadas

* **HTML5**: Estrutura da aplicação (`Canvas API`).
* **CSS3**: Estilização cibernética, efeitos Neon e HUD responsivo.
* **JavaScript (ES6+)**: Lógica de jogo orientada a objetos e modularizada.
* **Web Audio API**: Geração de efeitos sonoros sintéticos (sem arquivos de áudio externos).

---

## 📁 Estrutura de Arquivos do Projeto

```text
meu-jogo-tron/
├── css/
│   └── style.css            # Estilos visuais, variáveis neon e HUD
├── js/
│   ├── sons.js              # Sintetizador Web Audio API (lasers, motores, portal)
│   ├── grid.js              # Geração do mapa, edifícios, portal e colisões
│   ├── armas.js             # Lógica dos Discos de Ataque e Rastro de Luz (Light Trail)
│   ├── personagens.js       # Classe do Jogador e renderização do Light Cycle
│   ├── inimigos.js          # Inteligência Artificial dos inimigos
│   └── main.js              # Loop principal, gerenciamento de estados e entradas
├── Jogo Tron - Codigo Fonte.html  # Ponto de entrada do jogo
└── README.md                # Documentação técnica do projeto



