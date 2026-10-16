// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 12,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// DADOS FICTÍCIOS PADRONIZADOS DO 8º ANO (RESERVA LOCAL)
const dadosBoletimLocal = [
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

// VARIÁVEIS DE ESTADO DA SESSÃO
let pinSessao = "";
let dadosAtuais = [];
let emModoEdicao = false;

// Função para padronizar dados antigos (escala 0 a 100, vírgula, etc)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  if (typeof valor === 'string') {
    valor = valor.replace(',', '.').trim();
  }
  let numero = parseFloat(valor);
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

// Validação de nota digitada na edição (somente 0 a 10, ponto, vírgula ou vazio)
function validarNotaEdicao(valorTexto) {
  if (valorTexto === null || valorTexto === undefined) {
    return { valido: true, valor: null };
  }
  let texto = String(valorTexto).trim();
  if (texto === "") {
    return { valido: true, valor: null };
  }
  texto = texto.replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(texto)) {
    return { valido: false, valor: null };
  }
  const num = parseFloat(texto);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false, valor: null };
  }
  return { valido: true, valor: num };
}

// Validação de faltas digitadas na edição (inteiro >= 0)
function validarFaltaEdicao(valorTexto) {
  let texto = String(valorTexto).trim();
  if (!/^\d+$/.test(texto)) {
    return { valido: false, valor: null };
  }
  const num = parseInt(texto, 10);
  if (isNaN(num) || num < 0) {
    return { valido: false, valor: null };
  }
  return { valido: true, valor: num };
}

// Constrói e exibe a tabela e os cards de resumo
function renderizarBoletim() {
  const tabelaCorpo = document.getElementById('corpo-tabela');
  if (!tabelaCorpo) return;

  tabelaCorpo.innerHTML = "";

  let somaDasMedias = 0;
  let disciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdeBomDesempenho = 0;
  let qtdeAtencao = 0;

  dadosAtuais.forEach((item, index) => {
    let arrayFaltas = [0, 0, 0];
    if (Array.isArray(item.faltas)) {
      arrayFaltas = item.faltas.map(f => parseInt(f, 10) || 0);
    }

    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

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

    const totalFaltasDisciplina = arrayFaltas.reduce((a, b) => a + b, 0);
    totalFaltasGeral += totalFaltasDisciplina;

    const tr = document.createElement('tr');

    if (emModoEdicao) {
      tr.classList.add('linha-edicao');

      const tdNome = document.createElement('td');
      const spanNome = document.createElement('span');
      spanNome.className = "disciplina-nome";
      spanNome.textContent = item.disciplina || "";
      tdNome.appendChild(spanNome);

      const tdT1 = criarTdInputNota(`t1-${index}`, item.tri1);
      const tdT2 = criarTdInputNota(`t2-${index}`, item.tri2);
      const tdT3 = criarTdInputNota(`t3-${index}`, item.tri3);

      const txtMedia = mediaFinal !== null ? mediaFinal.toFixed(1).replace('.', ',') : "—";
      const tdMedia = document.createElement('td');
      const strongMedia = document.createElement('strong');
      strongMedia.textContent = txtMedia;
      tdMedia.appendChild(strongMedia);

      const tdF1 = criarTdInputFalta(`f1-${index}`, arrayFaltas[0]);
      const tdF2 = criarTdInputFalta(`f2-${index}`, arrayFaltas[1]);
      const tdF3 = criarTdInputFalta(`f3-${index}`, arrayFaltas[2]);

      const tdFaltasTotal = document.createElement('td');
      tdFaltasTotal.style.display = "none";
      tdFaltasTotal.textContent = String(totalFaltasDisciplina);

      const tdSit = document.createElement('td');
      tdSit.className = classeSituacao;
      tdSit.textContent = situacao;

      tr.appendChild(tdNome);
      tr.appendChild(tdT1);
      tr.appendChild(tdT2);
      tr.appendChild(tdT3);
      tr.appendChild(tdMedia);

      const tdFaltasContainer = document.createElement('td');
      const divFaltasGroup = document.createElement('div');
      divFaltasGroup.style.display = "flex";
      divFaltasGroup.style.gap = "4px";
      divFaltasGroup.appendChild(tdF1.children[0]);
      divFaltasGroup.appendChild(tdF2.children[0]);
      divFaltasGroup.appendChild(tdF3.children[0]);
      tdFaltasContainer.appendChild(divFaltasGroup);

      if (tdF1.children[1]) tdFaltasContainer.appendChild(tdF1.children[1]);
      if (tdF2.children[1]) tdFaltasContainer.appendChild(tdF2.children[1]);
      if (tdF3.children[1]) tdFaltasContainer.appendChild(tdF3.children[1]);

      tr.appendChild(tdFaltasContainer);
      tr.appendChild(tdSit);

    } else {
      const txt1 = n1 !== null ? n1.toFixed(1).replace('.', ',') : "—";
      const txt2 = n2 !== null ? n2.toFixed(1).replace('.', ',') : "—";
      const txt3 = n3 !== null ? n3.toFixed(1).replace('.', ',') : "—";
      const txtMedia = mediaFinal !== null ? mediaFinal.toFixed(1).replace('.', ',') : "—";

      const tdNome = document.createElement('td');
      const strongNome = document.createElement('strong');
      strongNome.textContent = item.disciplina || "";
      tdNome.appendChild(strongNome);

      const tdT1 = document.createElement('td');
      tdT1.textContent = txt1;

      const tdT2 = document.createElement('td');
      tdT2.textContent = txt2;

      const tdT3 = document.createElement('td');
      tdT3.textContent = txt3;

      const tdMedia = document.createElement('td');
      const strongMedia = document.createElement('strong');
      strongMedia.textContent = txtMedia;
      tdMedia.appendChild(strongMedia);

      const tdFaltas = document.createElement('td');
      tdFaltas.textContent = String(totalFaltasDisciplina);

      const tdSit = document.createElement('td');
      tdSit.className = classeSituacao;
      tdSit.textContent = situacao;

      tr.appendChild(tdNome);
      tr.appendChild(tdT1);
      tr.appendChild(tdT2);
      tr.appendChild(tdT3);
      tr.appendChild(tdMedia);
      tr.appendChild(tdFaltas);
      tr.appendChild(tdSit);
    }

    tabelaCorpo.appendChild(tr);
  });

  const mediaGeralFinal = disciplinasComMedia > 0 ? (somaDasMedias / disciplinasComMedia).toFixed(1).replace('.', ',') : "—";

  const elMediaGeral = document.getElementById('media-geral') || document.getElementById('card-media-geral');
  const elTotalFaltas = document.getElementById('total-faltas') || document.getElementById('card-total-faltas');
  const elQtdBom = document.getElementById('qtd-bom') || document.getElementById('card-bom-desempenho');
  const elQtdAtencao = document.getElementById('qtd-atencao') || document.getElementById('card-atencao');

  if (elMediaGeral) elMediaGeral.textContent = mediaGeralFinal;
  if (elTotalFaltas) elTotalFaltas.textContent = String(totalFaltasGeral);
  if (elQtdBom) elQtdBom.textContent = String(qtdeBomDesempenho);
  if (elQtdAtencao) elQtdAtencao.textContent = String(qtdeAtencao);
}

// Auxiliar para criar campo de nota no modo de edição
function criarTdInputNota(id, valorInicial) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = "text";
  input.id = id;
  input.className = "campo-edicao";

  const n = normalizarNota(valorInicial);
  input.value = n !== null ? String(n).replace('.', ',') : "";

  const erroSpan = document.createElement('span');
  erroSpan.className = "erro-campo";
  erroSpan.id = `erro-${id}`;

  td.appendChild(input);
  td.appendChild(erroSpan);
  return td;
}

// Auxiliar para criar campo de faltas no modo de edição
function criarTdInputFalta(id, valorInicial) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = "text";
  input.id = id;
  input.className = "campo-edicao campo-edicao-falta";
  input.value = valorInicial !== undefined && valorInicial !== null ? String(valorInicial) : "0";

  const erroSpan = document.createElement('span');
  erroSpan.className = "erro-campo";
  erroSpan.id = `erro-${id}`;

  td.appendChild(input);
  td.appendChild(erroSpan);
  return td;
}

// Manipulação das mensagens na tela
function exibirMensagem(idElemento, texto, tipo) {
  const el = document.getElementById(idElemento);
  if (!el) return;
  el.textContent = texto;
  el.className = "mensagem";
  if (tipo === "erro") {
    el.classList.add("mensagem-erro");
  } else if (tipo === "sucesso") {
    el.classList.add("mensagem-sucesso");
  }
}

// Login/Acesso ao Boletim via API
async function realizarAcesso(event) {
  event.preventDefault();

  const campoPin = document.getElementById('campo-pin');
  const btnEntrar = document.getElementById('botao-entrar');
  const pinDigitado = campoPin ? campoPin.value.trim() : "";

  if (!pinDigitado) {
    exibirMensagem('mensagem-acesso', 'Por favor, digite seu PIN.', 'erro');
    return;
  }

  exibirMensagem('mensagem-acesso', 'Conectando...', '');
  if (btnEntrar) btnEntrar.disabled = true;

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      exibirMensagem('mensagem-acesso', 'Turma, chamada ou PIN inválidos.', 'erro');
      if (btnEntrar) btnEntrar.disabled = false;
      return;
    }

    if (resposta.status === 429) {
      exibirMensagem('mensagem-acesso', 'Muitas tentativas. Aguarde um minuto e tente novamente.', 'erro');
      if (btnEntrar) btnEntrar.disabled = false;
      return;
    }

    if (!resposta.ok) {
      exibirMensagem('mensagem-acesso', 'Não foi possível conectar ao servidor. Tente novamente.', 'erro');
      if (btnEntrar) btnEntrar.disabled = false;
      return;
    }

    const resultado = await resposta.json();

    // Guarda o PIN apenas na memória da sessão
    pinSessao = pinDigitado;

    // Limpa o campo de PIN por segurança
    if (campoPin) campoPin.value = "";

    // Aplicação da regra de prioridade de dados
    if (resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      dadosAtuais = resultado.dados.disciplinas;
    } else {
      dadosAtuais = JSON.parse(JSON.stringify(dadosBoletimLocal));
    }

    // Esconde tela de login e exibe o boletim
    const areaAcesso = document.getElementById('area-acesso');
    const areaBoletim = document.getElementById('area-boletim');

    if (areaAcesso) areaAcesso.hidden = true;
    if (areaBoletim) areaBoletim.hidden = false;

    exibirMensagem('mensagem-acesso', '', '');
    renderizarBoletim();

  } catch (erro) {
    exibirMensagem('mensagem-acesso', 'Não foi possível conectar ao servidor. Tente novamente.', 'erro');
  } finally {
    if (btnEntrar) btnEntrar.disabled = false;
  }
}

// Ativa o modo de edição dos campos
function ativarModoEdicao() {
  emModoEdicao = true;

  const btnAlterar = document.getElementById('botao-alterar');
  const btnSalvar = document.getElementById('botao-salvar');
  const btnCancelar = document.getElementById('botao-cancelar');

  if (btnAlterar) btnAlterar.hidden = true;
  if (btnSalvar) btnSalvar.hidden = false;
  if (btnCancelar) btnCancelar.hidden = false;

  exibirMensagem('mensagem-edicao', '', '');
  renderizarBoletim();
}

// Cancela as alterações e sai do modo de edição
function cancelarEdicao() {
  emModoEdicao = false;

  const btnAlterar = document.getElementById('botao-alterar');
  const btnSalvar = document.getElementById('botao-salvar');
  const btnCancelar = document.getElementById('botao-cancelar');

  if (btnAlterar) btnAlterar.hidden = false;
  if (btnSalvar) btnSalvar.hidden = true;
  if (btnCancelar) btnCancelar.hidden = true;

  exibirMensagem('mensagem-edicao', '', '');
  renderizarBoletim();
}

// Valida, coleta e envia as alterações para a API
async function salvarAlteracoes() {
  let possuiErro = false;
  const novasDisciplinas = [];

  exibirMensagem('mensagem-edicao', '', '');

  // Limpa mensagens de erro de campos anteriores
  document.querySelectorAll('.erro-campo').forEach(el => el.textContent = "");
  document.querySelectorAll('.campo-edicao').forEach(el => {
    el.classList.remove('campo-invalido');
    el.removeAttribute('aria-invalid');
  });

  for (let index = 0; index < dadosAtuais.length; index++) {
    const itemOriginal = dadosAtuais[index];

    const inputT1 = document.getElementById(`t1-${index}`);
    const inputT2 = document.getElementById(`t2-${index}`);
    const inputT3 = document.getElementById(`t3-${index}`);

    const inputF1 = document.getElementById(`f1-${index}`);
    const inputF2 = document.getElementById(`f2-${index}`);
    const inputF3 = document.getElementById(`f3-${index}`);

    const valT1 = validarNotaEdicao(inputT1 ? inputT1.value : null);
    const valT2 = validarNotaEdicao(inputT2 ? inputT2.value : null);
    const valT3 = validarNotaEdicao(inputT3 ? inputT3.value : null);

    const valF1 = validarFaltaEdicao(inputF1 ? inputF1.value : "0");
    const valF2 = validarFaltaEdicao(inputF2 ? inputF2.value : "0");
    const valF3 = validarFaltaEdicao(inputF3 ? inputF3.value : "0");

    if (!valT1.valido && inputT1) marcarCampoInvalido(inputT1, `t1-${index}`, 'Nota deve ser de 0 a 10');
    if (!valT2.valido && inputT2) marcarCampoInvalido(inputT2, `t2-${index}`, 'Nota deve ser de 0 a 10');
    if (!valT3.valido && inputT3) marcarCampoInvalido(inputT3, `t3-${index}`, 'Nota deve ser de 0 a 10');

    if (!valF1.valido && inputF1) marcarCampoInvalido(inputF1, `f1-${index}`, 'Falta deve ser número inteiro');
    if (!valF2.valido && inputF2) marcarCampoInvalido(inputF2, `f2-${index}`, 'Falta deve ser número inteiro');
    if (!valF3.valido && inputF3) marcarCampoInvalido(inputF3, `f3-${index}`, 'Falta deve ser número inteiro');

    if (!valT1.valido || !valT2.valido || !valT3.valido || !valF1.valido || !valF2.valido || !valF3.valido) {
      possuiErro = true;
    } else {
      novasDisciplinas.push({
        disciplina: itemOriginal.disciplina,
        tri1: valT1.valor,
        tri2: valT2.valor,
        tri3: valT3.valor,
        faltas: [valF1.valor, valF2.valor, valF3.valor]
      });
    }
  }

  if (possuiErro) {
    exibirMensagem('mensagem-edicao', 'Corrija os campos destacados antes de salvar.', 'erro');
    return;
  }

  const btnSalvar = document.getElementById('botao-salvar');
  const btnCancelar = document.getElementById('botao-cancelar');

  if (btnSalvar) btnSalvar.disabled = true;
  if (btnCancelar) btnCancelar.disabled = true;
  exibirMensagem('mensagem-edicao', 'Salvando...', '');

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
      exibirMensagem('mensagem-edicao', 'Não foi possível salvar as alterações no servidor. Tente novamente.', 'erro');
      if (btnSalvar) btnSalvar.disabled = false;
      if (btnCancelar) btnCancelar.disabled = false;
      return;
    }

    // Sucesso: atualiza os dados na memória e finaliza o modo de edição
    dadosAtuais = novasDisciplinas;
    emModoEdicao = false;

    const btnAlterar = document.getElementById('botao-alterar');
    if (btnAlterar) btnAlterar.hidden = false;
    if (btnSalvar) btnSalvar.hidden = true;
    if (btnCancelar) btnCancelar.hidden = true;

    renderizarBoletim();
    exibirMensagem('mensagem-edicao', 'Dados salvos com sucesso.', 'sucesso');

  } catch (erro) {
    exibirMensagem('mensagem-edicao', 'Não foi possível salvar as alterações no servidor. Tente novamente.', 'erro');
  } finally {
    if (btnSalvar) btnSalvar.disabled = false;
    if (btnCancelar) btnCancelar.disabled = false;
  }
}

// Marca o elemento de entrada com erro visual
function marcarCampoInvalido(inputEl, id, msg) {
  inputEl.classList.add('campo-invalido');
  inputEl.setAttribute('aria-invalid', 'true');
  const errEl = document.getElementById(`erro-${id}`);
  if (errEl) errEl.textContent = msg;
}

// Inicialização de eventos da página
document.addEventListener('DOMContentLoaded', () => {
  const elTurma = document.getElementById('acesso-turma');
  const elChamada = document.getElementById('acesso-chamada');

  if (elTurma) elTurma.textContent = CONFIG_ALUNO.turma;
  if (elChamada) elChamada.textContent = String(CONFIG_ALUNO.numeroChamada);

  const formAcesso = document.getElementById('form-acesso');
  if (formAcesso) {
    formAcesso.addEventListener('submit', realizarAcesso);
  }

  const btnAlterar = document.getElementById('botao-alterar');
  if (btnAlterar) {
    btnAlterar.addEventListener('click', ativarModoEdicao);
  }

  const btnSalvar = document.getElementById('botao-salvar');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', salvarAlteracoes);
  }

  const btnCancelar = document.getElementById('botao-cancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', cancelarEdicao);
  }
});