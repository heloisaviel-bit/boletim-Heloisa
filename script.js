// DADOS FICTÍCIOS PADRONIZADOS DO 8º ANO
const dadosBoletim = [
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

// NOTA: O percentual de 92% exibido no card de frequência é apenas fictício/demonstrativo para esta etapa inicial.

// Função para padronizar e corrigir qualquer nota recebida para a escala de 0 a 10
function normalizarNota(valor) {
  // Se for vazio, null ou undefined
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se a nota vier como texto usando vírgula (ex: "7,8"), troca por ponto ("7.8")
  if (typeof valor === 'string') {
    valor = valor.replace(',', '.');
  }

  // Converte para número decimal
  let numero = parseFloat(valor);

  // Se não for um número válido, desconsidera
  if (isNaN(numero)) {
    return null;
  }

  // Se o valor estiver entre 0 e 10, já é a nota correta
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Se estiver entre 10 e 100 (ex: 82 ou 100), divide por 10 (vira 8.2 ou 10.0)
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Valores fora das regras acima são considerados inválidos
  return null;
}

// Função principal que constrói a tabela e atualiza os cards
function construirBoletim() {
  const tabelaCorpo = document.getElementById('tabela-boletim');
  
  let somaDasMedias = 0;
  let disciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdeBomDesempenho = 0;
  let qtdeAtencao = 0;

  // Passa por cada disciplina da nossa lista (forEach)
  dadosBoletim.forEach(item => {
    // Normaliza as notas de cada trimestre
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a média considerando apenas as notas existentes (que não são null)
    let somaNotas = 0;
    let notasValidasCount = 0;

    if (n1 !== null) { somaNotas += n1; notasValidasCount++; }
    if (n2 !== null) { somaNotas += n2; notasValidasCount++; }
    if (n3 !== null) { somaNotas += n3; notasValidasCount++; }

    let mediaFinal = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "status-indisponivel";

    if (notasValidasCount > 0) {
      mediaFinal = somaNotas / notasValidasCount;
      somaDasMedias += mediaFinal;
      disciplinasComMedia++;

      if (mediaFinal >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "status-bom";
        qtdeBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "status-atencao";
        qtdeAtencao++;
      }
    }

    // Soma o total de faltas da disciplina
    const totalFaltasDisciplina = item.faltas.reduce((a, b) => a + b, 0);
    totalFaltasGeral += totalFaltasDisciplina;

    // Formata a exibição do texto na tabela
    const txt1 = n1 !== null ? n1.toFixed(1).replace('.', ',') : "—";
    const txt2 = n2 !== null ? n2.toFixed(1).replace('.', ',') : "—";
    const txt3 = n3 !== null ? n3.toFixed(1).replace('.', ',') : "—";
    const txtMedia = mediaFinal !== null ? mediaFinal.toFixed(1).replace('.', ',') : "—";

    // Cria a linha (tr) no HTML via DOM
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${txt1}</td>
      <td>${txt2}</td>
      <td>${txt3}</td>
      <td><strong>${txtMedia}</strong></td>
      <td>${totalFaltasDisciplina}</td>
      <td class="${classeSituacao}">${situacao}</td>
    `;
    tabelaCorpo.appendChild(tr);
  });

  // Atualiza os cards no topo com os resultados
  const mediaGeralFinal = disciplinasComMedia > 0 ? (somaDasMedias / disciplinasComMedia).toFixed(1).replace('.', ',') : "—";
  
  document.getElementById('card-media-geral').innerText = mediaGeralFinal;
  document.getElementById('card-total-faltas').innerText = totalFaltasGeral;
  document.getElementById('card-bom-desempenho').innerText = qtdeBomDesempenho;
  document.getElementById('card-atencao').innerText = qtdeAtencao;
}

// Executa a função quando a página carrega
document.addEventListener('DOMContentLoaded', construirBoletim);