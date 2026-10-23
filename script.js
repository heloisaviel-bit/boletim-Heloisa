// Configuração fixa do aluno
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 12,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Dados fictícios do 8º Ano como fallback
const disciplinasPadrao = [
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

// Estado da sessão (mantido em memória)
let disciplinasEmUso = [];
let pinSessao = "";

// Normalização para dados antigos/locais do projeto
function normalizarNotaAntiga(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === "string" && valor.trim() === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.trim().replace(",", ".");
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0 || numero > 100) {
    return null;
  }

  if (numero <= 10) {
    return numero;
  }

  return numero / 10;
}

// Validação estrita para o que o aluno digita no editor
function validarENormalizarNotaEdicao(valor) {
  if (valor === null || valor === undefined) {
    return { valido: true, valor: null };
  }

  const texto = String(valor).trim();
  if (texto === "") {
    return { valido: true, valor: null };
  }

  // Não aceita valores no formato antigo (como 75, 82, 100)
  const padrao = /^(10([.,]0)?|[0-9]([.,][0-9]+)?)$/;
  if (!padrao.test(texto)) {
    return { valido: false, valor: null };
  }

  const num = Number(texto.replace(",", "."));
  if (!Number.isFinite(num) || num < 0 || num > 10) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: num };
}

// Validação para faltas no editor
function validarFaltaEdicao(valor) {
  const texto = String(valor).trim();
  if (texto === "") {
    return { valido: false, valor: null };
  }

  const padrao = /^[0-9]+$/;
  if (!padrao.test(texto)) {
    return { valido: false, valor: null };
  }

  const num = Number(texto);
  if (!Number.isInteger(num) || num < 0) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: num };
}

// Obter valor numérico seguro da nota para cálculos
function obterNotaCalculo(valor) {
  const resEdicao = validarENormalizarNotaEdicao(valor);
  if (resEdicao.valido) {
    return resEdicao.valor;
  }
  return normalizarNotaAntiga(valor);
}

// Calcula a média usando somente as notas disponíveis
function calcularMedia(item) {
  const notas = [
    obterNotaCalculo(item.tri1),
    obterNotaCalculo(item.tri2),
    obterNotaCalculo(item.tri3)
  ].filter(nota => nota !== null);

  if (notas.length === 0) {
    return null;
  }

  const soma = notas.reduce((total, nota) => total + nota, 0);
  return soma / notas.length;
}

// Soma as faltas
function somarFaltas(faltas) {
  if (!Array.isArray(faltas)) return 0;
  return faltas.reduce((total, falta) => {
    const num = Number(falta);
    return total + (Number.isFinite(num) ? num : 0);
  }, 0);
}

// Define a situação de cada disciplina
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }

  if (media >= 6) {
    return "Bom desempenho";
  }

  return "Atenção";
}

// Mostra uma nota com uma casa decimal ou informa que está ausente
function formatarNota(nota) {
  if (nota === null || nota === undefined) {
    return "Ainda não lançada";
  }

  return nota.toFixed(1).replace(".", ",");
}

// Cria uma célula da tabela com texto seguro
function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = String(texto);
  return celula;
}

// Preenche a tabela limpando antes para evitar duplicação
function preencherTabela() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  disciplinasEmUso.forEach(item => {
    const nota1 = obterNotaCalculo(item.tri1);
    const nota2 = obterNotaCalculo(item.tri2);
    const nota3 = obterNotaCalculo(item.tri3);
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

// Calcula e atualiza os cards do resumo
function preencherCards() {
  let somaMedias = 0;
  let quantidadeMedias = 0;
  let totalFaltas = 0;
  let quantidadeBom = 0;
  let quantidadeAtencao = 0;

  disciplinasEmUso.forEach(item => {
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

// Realizar Login (Abrir Boletim via API)
async function realizarLogin() {
  const campoPin = document.getElementById("campo-pin");
  const msgLogin = document.getElementById("mensagem-login");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite seu PIN.";
    msgLogin.className = "mensagem-status erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    const resultado = await resposta.json();

    // Guardar PIN em memória e limpar o input por segurança
    pinSessao = pinDigitado;
    campoPin.value = "";

    // Tratar carregamento dos dados
    if (resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      disciplinasEmUso = resultado.dados.disciplinas;
    } else {
      disciplinasEmUso = JSON.parse(JSON.stringify(disciplinasPadrao));
    }

    // Exibir o boletim
    document.getElementById("area-login").classList.add("oculto");
    document.getElementById("conteudo-boletim").classList.remove("oculto");

    preencherTabela();
    preencherCards();

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "mensagem-status erro";
  }
}

// Montar Formulário de Edição
function construirFormularioEdicao() {
  const container = document.getElementById("container-formulario-edicao");
  container.innerHTML = "";

  disciplinasEmUso.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item-edicao";

    const titulo = document.createElement("h4");
    titulo.textContent = item.disciplina;
    itemDiv.appendChild(titulo);

    const grid = document.createElement("div");
    grid.className = "campos-grid";

    const f1 = item.faltas && item.faltas[0] !== undefined ? item.faltas[0] : 0;
    const f2 = item.faltas && item.faltas[1] !== undefined ? item.faltas[1] : 0;
    const f3 = item.faltas && item.faltas[2] !== undefined ? item.faltas[2] : 0;

    const campos = [
      { id: `tri1_${index}`, rotulo: "Nota 1º Tri", valor: item.tri1 ?? "" },
      { id: `tri2_${index}`, rotulo: "Nota 2º Tri", valor: item.tri2 ?? "" },
      { id: `tri3_${index}`, rotulo: "Nota 3º Tri", valor: item.tri3 ?? "" },
      { id: `falta1_${index}`, rotulo: "Faltas 1º Tri", valor: f1 },
      { id: `falta2_${index}`, rotulo: "Faltas 2º Tri", valor: f2 },
      { id: `falta3_${index}`, rotulo: "Faltas 3º Tri", valor: f3 }
    ];

    campos.forEach(c => {
      const grupo = document.createElement("div");
      grupo.className = "campo-grupo";

      const label = document.createElement("label");
      label.setAttribute("for", c.id);
      label.textContent = c.rotulo;

      const input = document.createElement("input");
      input.type = "text";
      input.id = c.id;
      input.value = c.valor !== null ? c.valor : "";

      grupo.appendChild(label);
      grupo.appendChild(input);
      grid.appendChild(grupo);
    });

    itemDiv.appendChild(grid);
    container.appendChild(itemDiv);
  });
}

// Alternar Painel de Edição
function alternarEdicao() {
  const painel = document.getElementById("painel-edicao");
  const msgEdicao = document.getElementById("mensagem-edicao");
  msgEdicao.textContent = "";

  if (painel.classList.contains("oculto")) {
    construirFormularioEdicao();
    painel.classList.remove("oculto");
  } else {
    painel.classList.add("oculto");
  }
}

// Salvar Alterações na API
async function salvarAlteracoes() {
  const msgEdicao = document.getElementById("mensagem-edicao");
  msgEdicao.textContent = "";
  
  let houverErro = false;
  const novasDisciplinas = [];

  // Remover marcações anteriores de erro
  document.querySelectorAll(".campo-invalido").forEach(input => {
    input.classList.remove("campo-invalido");
  });

  for (let index = 0; index < disciplinasEmUso.length; index++) {
    const discOriginal = disciplinasEmUso[index];

    const inputTri1 = document.getElementById(`tri1_${index}`);
    const inputTri2 = document.getElementById(`tri2_${index}`);
    const inputTri3 = document.getElementById(`tri3_${index}`);
    const inputFalta1 = document.getElementById(`falta1_${index}`);
    const inputFalta2 = document.getElementById(`falta2_${index}`);
    const inputFalta3 = document.getElementById(`falta3_${index}`);

    const resTri1 = validarENormalizarNotaEdicao(inputTri1.value);
    const resTri2 = validarENormalizarNotaEdicao(inputTri2.value);
    const resTri3 = validarENormalizarNotaEdicao(inputTri3.value);

    const resFalta1 = validarFaltaEdicao(inputFalta1.value);
    const resFalta2 = validarFaltaEdicao(inputFalta2.value);
    const resFalta3 = validarFaltaEdicao(inputFalta3.value);

    if (!resTri1.valido) { inputTri1.classList.add("campo-invalido"); houverErro = true; }
    if (!resTri2.valido) { inputTri2.classList.add("campo-invalido"); houverErro = true; }
    if (!resTri3.valido) { inputTri3.classList.add("campo-invalido"); houverErro = true; }

    if (!resFalta1.valido) { inputFalta1.classList.add("campo-invalido"); houverErro = true; }
    if (!resFalta2.valido) { inputFalta2.classList.add("campo-invalido"); houverErro = true; }
    if (!resFalta3.valido) { inputFalta3.classList.add("campo-invalido"); houverErro = true; }

    novasDisciplinas.push({
      disciplina: discOriginal.disciplina,
      tri1: resTri1.valor,
      tri2: resTri2.valor,
      tri3: resTri3.valor,
      faltas: [resFalta1.valor, resFalta2.valor, resFalta3.valor]
    });
  }

  if (houverErro) {
    msgEdicao.textContent = "Existem campos com valores inválidos. Verifique os campos destacados.";
    msgEdicao.className = "mensagem-status erro";
    return;
  }

  msgEdicao.textContent = "Salvando...";
  msgEdicao.className = "mensagem-status info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.textContent = "Não foi possível salvar as alterações no servidor.";
      msgEdicao.className = "mensagem-status erro";
      return;
    }

    // Atualizar estado em memória e re-renderizar
    disciplinasEmUso = novasDisciplinas;
    preencherTabela();
    preencherCards();

    msgEdicao.textContent = "Dados salvos com sucesso.";
    msgEdicao.className = "mensagem-status sucesso";

    setTimeout(() => {
      document.getElementById("painel-edicao").classList.add("oculto");
    }, 1200);

  } catch (erro) {
    msgEdicao.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgEdicao.className = "mensagem-status erro";
  }
}

// Eventos da aplicação
document.addEventListener("DOMContentLoaded", () => {
  const btnEntrar = document.getElementById("btn-entrar");
  const campoPin = document.getElementById("campo-pin");
  const btnAlternar = document.getElementById("btn-alternar-edicao");
  const btnSalvar = document.getElementById("btn-salvar-alteracoes");
  const btnCancelar = document.getElementById("btn-cancelar-edicao");

  if (btnEntrar) btnEntrar.addEventListener("click", realizarLogin);
  if (campoPin) {
    campoPin.addEventListener("keypress", (e) => {
      if (e.key === "Enter") realizarLogin();
    });
  }

  if (btnAlternar) btnAlternar.addEventListener("click", alternarEdicao);
  if (btnSalvar) btnSalvar.addEventListener("click", salvarAlteracoes);
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      document.getElementById("painel-edicao").classList.add("oculto");
    });
  }
});