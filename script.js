const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const erro = document.getElementById('erro');
let tempoInatividade;

function login() {
  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;

  if (usuario === 'admin' && senha === '1234') {
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    iniciarContadorInatividade();
    carregarVoluntarios();
  } else {
    alert('Usuário ou senha incorretos');
  }
}

function mostrarSecao(secao) {
  document.getElementById('cadastro').style.display = secao === 'cadastro' ? 'block' : 'none';
  document.getElementById('lista').style.display = secao === 'lista' ? 'block' : 'none';
}

function cadastrarVoluntario() {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const cep = document.getElementById('cep').value.trim();

  if (!nome || !email || !cep) {
    erro.textContent = 'Preencha todos os campos';
    return;
  }

  let voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];

  if (voluntarios.some(v => v.email === email)) {
    erro.textContent = 'Email já cadastrado';
    return;
  }

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(res => res.json())
    .then(dados => {
      if (dados.erro) {
        erro.textContent = 'CEP inválido';
        return;
      }

      const endereco = `${dados.logradouro}, ${dados.bairro}, ${dados.localidade} - ${dados.uf}`;
      const foto = `https://source.unsplash.com/160x160/?voluntario,${encodeURIComponent(nome)}`;

      voluntarios.push({ nome, email, endereco, foto });
      localStorage.setItem('voluntarios', JSON.stringify(voluntarios));
      erro.textContent = '';
      document.getElementById('nome').value = '';
      document.getElementById('email').value = '';
      document.getElementById('cep').value = '';
      carregarVoluntarios();
      mostrarSecao('lista');
    });
}

function carregarVoluntarios() {
  const container = document.getElementById('voluntarios');
  container.innerHTML = '';
  const filtro = document.getElementById('filtro').value.toLowerCase();

  let voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];
  voluntarios.filter(v => v.nome.toLowerCase().includes(filtro)).forEach((v, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${v.foto}" alt="foto">
      <div class="card-info">
        <strong>${v.nome}</strong><br>
        ${v.email}<br>
        ${v.endereco}
      </div>
      <button onclick="removerVoluntario(${i})">Excluir</button>
    `;
    container.appendChild(div);
  });
}

function filtrarVoluntarios() {
  carregarVoluntarios();
}

function removerVoluntario(index) {
  let voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];
  voluntarios.splice(index, 1);
  localStorage.setItem('voluntarios', JSON.stringify(voluntarios));
  carregarVoluntarios();
}

function limparTodos() {
  if (confirm('Tem certeza que deseja apagar todos os cadastros?')) {
    localStorage.removeItem('voluntarios');
    carregarVoluntarios();
  }
}

function iniciarContadorInatividade() {
  resetarContador();
  document.onclick = resetarContador;
  document.onkeydown = resetarContador;
}

function resetarContador() {
  clearTimeout(tempoInatividade);
  tempoInatividade = setTimeout(() => {
    alert('Sessão expirada por inatividade');
    location.reload();
  }, 300000); // 5 minutos
}
