// Todos os dados da loja ficam aqui. O que não foi confirmado com a Pink está com confirmed: false
// e aparece no site como "Consulte a equipe". Fotos: ilustrativas (Unsplash), até chegarem as reais.
// Fontes (30/10/2026): Google Maps, bio e posts do Instagram @pinkcuritiba.
window.PINK = {
  loja: {
    nome: 'Pink Calçados',
    endereco: 'Av. República Argentina, 1539',
    bairro: 'Água Verde',
    cidade: 'Curitiba - PR',
    cep: '80620-010',
    telefone: '(41) 3528-9677', // fixo, do Google Maps
    instagram: 'pinkcuritiba',
    notaGoogle: '4,9',
    avaliacoes: 447,
    seguidores: '18,1 mil',
    desconto: 'até 70% OFF', // bio do Instagram
    confirmed: true,
  },
  // Link "Fale com uma consultora" da bio. É um link curto do WhatsApp Business: não aceita mensagem pronta,
  // então o site copia o pedido antes de abrir. Com o número confirmado, preencha `numero` (ex.: '5541999999999')
  // e a mensagem passa a ir pronta.
  whatsapp: { link: 'https://wa.me/message/SNHBTNJ7T6NLF1', numero: '', confirmed: true },
  horario: [
    ['Segunda a sexta', '10h às 18h50'],
    ['Sábado', '9h às 13h50'],
    ['Domingo', 'Fechado'],
  ], // Google Maps; pode mudar em feriados
  entrega: { texto: 'Motoboy: consulte a área e a taxa', confirmed: false }, // uma avaliação cita entrega por motoboy
  pagamento: { texto: 'Consulte a equipe', confirmed: false },
  numeracao: [34, 35, 36, 37, 38, 39, 40], // apenas visual até a loja confirmar o estoque
  // Categorias e marcas: confirmadas por posts da loja. Os modelos são exemplos ilustrativos.
  categorias: [
    { id: 'tenis', nome: 'Tênis', marcas: 'Moleca, Vizzano e Actvitta', modelos: [
      { id: 'tenis-casual-bege', nome: 'Tênis casual bege', foto: '1622760806364-5ccac8096b59', texto: 'Casual e leve, para o dia todo, com qualquer roupa.' },
      { id: 'tenis-rosa', nome: 'Tênis rosa', foto: '1692735332246-3b1576a0a669', texto: 'Cor para alegrar o jeans e o moletom.' },
    ] },
    { id: 'sandalia', nome: 'Sandálias', marcas: 'Vizzano', modelos: [
      { id: 'sandalia-nude-laco', nome: 'Sandália nude com laço', foto: '1590099033615-be195f8d575c', texto: 'Salto fino e laço com brilho, para festa e para sair à noite.' },
      { id: 'sandalia-salto-bloco', nome: 'Sandália salto bloco', foto: '1595970487296-8818e128ac4b', texto: 'Salto bloco, firme para ficar de pé a noite toda.' },
    ] },
    { id: 'rasteirinha', nome: 'Rasteirinhas', marcas: 'Moleca', modelos: [
      { id: 'rasteirinha-trancada', nome: 'Rasteirinha trançada', foto: '1618615098938-84fc29796e76', texto: 'Tiras trançadas e solado baixinho, do dia a dia ao fim de semana.' },
      { id: 'rasteirinha-tiras-largas', nome: 'Rasteirinha de tiras largas', foto: '1605445175147-8d2340ea9065', texto: 'Calça fácil e segura bem o pé.' },
    ] },
    { id: 'bota', nome: 'Botas', marcas: 'Beira Rio', modelos: [
      { id: 'bota-cano-curto-caramelo', nome: 'Bota cano curto caramelo', foto: '1605733160314-4fc7dac4bb16', texto: 'Cano curto e salto baixo, para o frio de Curitiba.' },
      { id: 'bota-salto-fino-preta', nome: 'Bota salto fino preta', foto: '1602250523342-d2212b96a297', texto: 'Salto fino e bico fino, de calça ou de vestido.' },
      { id: 'bota-amarrar-off-white', nome: 'Bota de amarrar off-white', foto: '1610398752800-146f269dfcc8', texto: 'Amarração na frente e salto bloco, firme para andar.' },
    ] },
  ],
};
