// Dados fictícios do 8º Ano.
// Nenhum dado é buscado em servidores externos.
const disciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// Transforma notas de formatos diferentes em números de 0 a 10.
function normalizarNota(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === "string" && valor.trim() === "") {
    return null;
  }

  // Aceita vírgula decimal, como "8,5".
  if (typeof valor === "string") {
    valor = valor.trim().replace(",", ".");
  }

  const numero = Number(valor);

  // Não aceita textos inválidos nem valores fora da escala permitida.
  if (!Number.isFinite(numero) || numero < 0 || numero > 100) {
    return null;
  }

  // Valores de 0 a 10 já estão na escala correta.
  if (numero <= 10) {
    return numero;
  }

  // Valores acima de 10 até 100 são convertidos para a escala de 0 a 10.
  return numero / 10;
}

// Calcula a média usando somente as notas disponíveis.
function calcularMedia(item) {
  const notas = [
    normalizarNota(item.tri1),
    normalizarNota(item.tri2),
    normalizarNota(item.tri3)
  ].filter(nota => nota !== null);

  if (notas.length === 0) {
    return null;
  }

  const soma = notas.reduce((total, nota) => total + nota, 0);
  return soma / notas.length;
}

// Soma as faltas dos três trimestres.
function somarFaltas(faltas) {
  return faltas.reduce((total, falta) => total + falta, 0);
}

// Define a situação de cada disciplina.
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }

  if (media >= 6) {
    return "Bom desempenho";
  }

  return "Atenção";
}

// Mostra uma nota com uma casa decimal ou informa que está ausente.
function formatarNota(nota) {
  if (nota === null) {
    return "Ainda não lançada";
  }

  return nota.toFixed(1).replace(".", ",");
}

// Cria uma célula da tabela com texto seguro.
function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

// Preenche a tabela com as disciplinas.
function preencherTabela() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  disciplinas.forEach(item => {
    const nota1 = normalizarNota(item.tri1);
    const nota2 = normalizarNota(item.tri2);
    const nota3 = normalizarNota(item.tri3);
    const media = calcularMedia(item);
    const faltas = somarFaltas(item.faltas);
    const situacao = definirSituacao(media);

    const linha = document.createElement("tr");

    linha.appendChild(criarCelula(item.disciplina));
    linha.appendChild(criarCelula(formatarNota(nota1)));
    linha.appendChild(criarCelula(formatarNota(nota2)));
    linha.appendChild(criarCelula(formatarNota(nota3)));
    linha.appendChild(criarCelula(formatarNota(media)));
    linha.appendChild(criarCelula(String(faltas)));

    const celulaSituacao = criarCelula(situacao);

    if (situacao === "Bom desempenho") {
      celulaSituacao.className = "status-bom";
    } else if (situacao === "Atenção") {
      celulaSituacao.className = "status-atencao";
    } else {
      celulaSituacao.className = "status-indisponivel";
    }

    linha.appendChild(celulaSituacao);
    corpoTabela.appendChild(linha);
  });
}

// Calcula e atualiza os cards do resumo.
function preencherCards() {
  let somaMedias = 0;
  let quantidadeMedias = 0;
  let totalFaltas = 0;
  let quantidadeBom = 0;
  let quantidadeAtencao = 0;

  disciplinas.forEach(item => {
    const media = calcularMedia(item);

    if (media !== null) {
      somaMedias += media;
      quantidadeMedias++;

      if (media >= 6) {
        quantidadeBom++;
      } else {
        quantidadeAtencao++;
      }
    }

    totalFaltas += somarFaltas(item.faltas);
  });

  const mediaGeral = quantidadeMedias > 0
    ? (somaMedias / quantidadeMedias).toFixed(1).replace(".", ",")
    : "—";

  document.getElementById("media-geral").textContent = mediaGeral;
  document.getElementById("total-faltas").textContent = totalFaltas;
  document.getElementById("qtd-bom").textContent = quantidadeBom;
  document.getElementById("qtd-atencao").textContent = quantidadeAtencao;
}

// Frequência de 92% apenas demonstrativa.
// No futuro, ela será tratada separadamente, sem fórmula inventada baseada nas faltas.

// Inicia o boletim quando o HTML estiver pronto.
document.addEventListener("DOMContentLoaded", () => {
  preencherTabela();
  preencherCards();
});
