# Calendário Editorial — Gerador de PDF

App em Next.js para montar o **calendário editorial** de um cliente e exportar um
**pôster A4 em PDF**, no estilo: fundo preto, texto branco, detalhes em laranja e
tipografia **Transducer**.

## Como funciona

1. Preencha **Cliente**, **Mês** e **Ano** (o dia da semana de cada conteúdo é
   sincronizado automaticamente com o calendário real).
2. Adicione quantos **conteúdos** quiser. Cada um tem **dia**, **título**
   (pode ser longo), **formato** (Post Único · Reels · Carrossel · Stories) e uma
   descrição opcional.
3. Vários conteúdos podem cair no **mesmo dia** — o layout em grade acomoda todos.
4. Clique em **Baixar PDF** → no diálogo do navegador escolha **"Salvar como PDF"**.
   Em *Mais configurações*, deixe **Margens: Nenhuma** e marque
   **Gráficos de plano de fundo** para preservar o preto e o laranja.

Os dados ficam salvos no navegador (localStorage).

## Rodar localmente

```bash
npm install
npm run dev
```

## Fontes

A família **Transducer** (OTF) está embutida em `public/fonts` e carregada via
`@font-face`. Uso restrito ao projeto pessoal do proprietário da licença.

## Stack

Next.js 15 · React 18 · sem dependências de runtime extras (PDF via impressão do
navegador, layout em milímetros idêntico em tela e impressão).
