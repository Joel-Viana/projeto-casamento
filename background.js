// espera o HTML carregar antes de buscar as imagens
document.addEventListener('DOMContentLoaded', () => {

  // pega todas as imagens do background
  const imagens = Array.from(document.querySelectorAll('.background .bg-img')); // NodeList -> Array

  // se não tiver imagens, sai fora
  if (imagens.length === 0) return;

  // garante que só UMA começa ativa
  imagens.forEach((img, i) => {
    img.classList.toggle('ativa', i === 0); // true só para a primeira
  });

  let atual = 0;                 // índice atual
  const INTERVALO = 15000;        // ms (6s)

  setInterval(() => {

    // desativa a atual
    imagens[atual].classList.remove('ativa');

    // calcula a próxima
    atual = (atual + 1) % imagens.length;

    // ativa a próxima
    imagens[atual].classList.add('ativa');

  }, INTERVALO);
});
