// web/js/script.js - Dashboard de Equipamentos
const mainEquipamentos = document.getElementById('equipamentos');
const novoEquipamentoBtn = document.getElementById('novoEquipamento');
const sairBtn = document.getElementById('sair');
const modalExcluir = document.getElementById('modalExcluir');
const modalComentarios = document.getElementById('modalComentarios');
const modalCadastro = document.getElementById('modalCadastroEquipamento');
const confirmarExclusao = document.getElementById('confirmarExclusao');
const cancelarExclusao = document.getElementById('cancelarExclusao');
const novoComentarioInput = document.getElementById('novoComentario');
const adicionarComentarioBtn = document.getElementById('adicionarComentario');
const fecharComentarios = document.getElementById('fecharComentarios');
const nomeEquipamento = document.getElementById('nomeEquipamento');
const imagemEquipamento = document.getElementById('imagemEquipamento');
const descricaoEquipamento = document.getElementById('descricaoEquipamento');
const ativoEquipamento = document.getElementById('ativoEquipamento');
const cadastrarEquipamento = document.getElementById('cadastrarEquipamento');
const fecharCadastro = document.getElementById('fecharCadastro');
const comentariosList = document.getElementById('comentariosList');

let usuarioPerfil = null;  
let usuarioNome = null;    
let equipamentoAtual = null;  

function fecharModal(modal) {
  modal.style.display = 'none';
}

function renderizarComentario(comentario) {
  const div = document.createElement('div');
  div.className = 'comentario-item';
  const data = new Date(comentario.createdAt).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });  
  div.innerHTML = `
    <div class="comentario-header">
      <span class="comentario-perfil">${comentario.usuario.perfil.nome}</span>  <!-- Cargo/perfil -->
      <span>${comentario.usuario.nome} - ${data}</span>  <!-- Nome e data -->
    </div>
    <div class="comentario-texto">${comentario.texto}</div>
  `;
  return div;
}

async function inicializar() {
  try {
    // Fetch perfil e nome da session
    const resPerfil = await fetch('/api/perfil', { credentials: 'include' });
    if (!resPerfil.ok) {
      if (resPerfil.status === 401) {
        console.log('❌ Não logado - Redirecionando para login');
        window.location.href = '/login.html';
        return;
      }
      throw new Error('Erro ao verificar perfil');
    }
    const perfilData = await resPerfil.json();
    usuarioPerfil = perfilData.perfil;
    usuarioNome = perfilData.nome || 'Usuário Anônimo';
    console.log('✅ Perfil carregado:', usuarioPerfil, 'Nome:', usuarioNome);

    // Botão novo equipamento: Hidden por default, só mostra para admin
    novoEquipamentoBtn.style.display = 'none';
    if (usuarioPerfil === 'Administrador') {
      novoEquipamentoBtn.style.display = 'block';
      console.log('👑 Modo admin ativado - Botão novo visível');
    } else {
      console.log('👤 Modo comum - Botão novo hidden');
    }

    // Carrega lista de equipamentos
    await carregarEquipamentos();
  } catch (error) {
    console.error('Erro na inicialização:', error);
    alert('Erro ao carregar dashboard. Verifique login.');
    window.location.href = '/login.html';
  }
}

// Carrega e renderiza equipamentos (com badge ativo e fallback img)
async function carregarEquipamentos() {
  try {
    const res = await fetch('/api/equipamentos', { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) window.location.href = '/login.html';
      throw new Error(`Erro ${res.status}: ${res.statusText}`);
    }
    const equipamentos = await res.json();
    console.log('📋 Equipamentos carregados:', equipamentos.length, 'itens');

    mainEquipamentos.innerHTML = '';  // Limpa lista
    if (equipamentos.length === 0) {
      mainEquipamentos.innerHTML = '<p>Nenhum equipamento ativo encontrado.</p>';
      return;
    }

    equipamentos.forEach(equip => {
      const div = document.createElement('div');
      div.className = `equipamento-card ${equip.ativo ? 'ativo' : ''}`;  // Badge se ativo
      const imgSrc = equip.imagem ? `/assets/${equip.imagem}` : 'https://via.placeholder.com/300x200?text=Sem+Imagem';  // Path completo + fallback
      div.innerHTML = `
        <img src="${imgSrc}" alt="${equip.nome}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+N%C3%A3o+Encontrada'" />
        <div class="info">
          <h3>${equip.nome}</h3>
          <p>${equip.descricao}</p>
          <div class="acoes">
            <button onclick="abrirComentarios(${equip.id})">Comentários</button>
            ${usuarioPerfil === 'Administrador' ? `<button onclick="abrirExclusao(${equip.id}, '${equip.nome.replace(/'/g, "\\'")}')">Excluir</button>` : ''}
          </div>
        </div>
      `;
      mainEquipamentos.appendChild(div);
    });
  } catch (error) {
    console.error('Erro ao carregar equipamentos:', error);
    mainEquipamentos.innerHTML = '<p>Erro ao carregar equipamentos. Tente novamente.</p>';
  }
}

// Modal Novo Equipamento (bloqueado para não-admin)
novoEquipamentoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (usuarioPerfil !== 'Administrador') {
    alert('Apenas administradores podem cadastrar equipamentos.');
    return;
  }
  // Limpa form
  nomeEquipamento.value = ''; 
  imagemEquipamento.value = ''; 
  descricaoEquipamento.value = ''; 
  ativoEquipamento.checked = true;
  modalCadastro.style.display = 'block';
});

fecharCadastro.addEventListener('click', () => fecharModal(modalCadastro));

cadastrarEquipamento.addEventListener('click', async () => {
  if (usuarioPerfil !== 'Administrador') {
    alert('Apenas administradores podem cadastrar.');
    return;
  }
  const nome = nomeEquipamento.value.trim();
  const imagem = imagemEquipamento.value.trim();
  const descricao = descricaoEquipamento.value.trim();
  const ativo = ativoEquipamento.checked;

  if (!nome || !descricao) {
    alert('Nome e descrição são obrigatórios!');
    return;
  }

  try {
    const res = await fetch('/api/equipamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, descricao, imagem, ativo }),
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json();
      if (err.error.includes('admin')) alert('Acesso negado: Apenas admin.');
      else throw new Error(err.error || 'Erro ao criar');
    }

    const data = await res.json();
    console.log('✅ Equipamento criado:', data.equipamento.nome);
    alert('Equipamento cadastrado com sucesso!');
    fecharModal(modalCadastro);
    await carregarEquipamentos();  // Recarrega lista
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    alert(error.message);
  }
});

// Modal Exclusão (bloqueado para não-admin)
function abrirExclusao(id, nome) {
  if (usuarioPerfil !== 'Administrador') {
    alert('Apenas administradores podem excluir.');
    return;
  }
  equipamentoAtual = { id, nome };
  document.querySelector('#modalExcluir h2').textContent = `Excluir "${nome}"?`;
  modalExcluir.style.display = 'block';
}

confirmarExclusao.addEventListener('click', async () => {
  if (!equipamentoAtual || usuarioPerfil !== 'Administrador') {
    alert('Acesso negado.');
    return;
  }

  try {
    const res = await fetch(`/api/equipamentos/${equipamentoAtual.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir');
    }

    console.log('✅ Equipamento excluído:', equipamentoAtual.id);
    alert('Equipamento excluído com sucesso!');
    fecharModal(modalExcluir);
    equipamentoAtual = null;
    await carregarEquipamentos();  // Recarrega lista
  } catch (error) {
    console.error('Erro ao excluir:', error);
    alert(error.message);
  }
});

cancelarExclusao.addEventListener('click', () => {
  fecharModal(modalExcluir);
  equipamentoAtual = null;
});

// Modal Comentários (real: fetch lista + POST novo)
async function abrirComentarios(id) {
  equipamentoAtual = { id };
  comentariosList.innerHTML = '<p>Carregando comentários...</p>';
  modalComentarios.style.display = 'block';
  novoComentarioInput.value = '';

  try {
    const res = await fetch(`/api/equipamentos/${id}/comentarios`, { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) window.location.href = '/login.html';
      throw new Error('Erro ao carregar comentários');
    }
    const comentarios = await res.json();
    console.log(`📝 ${comentarios.length} comentários carregados para ID ${id}`);

    comentariosList.innerHTML = '';  // Limpa
    if (comentarios.length === 0) {
      comentariosList.innerHTML = '<p>Nenhum comentário ainda. Seja o primeiro!</p>';
    } else {
      comentarios.forEach(comentario => {
        comentariosList.appendChild(renderizarComentario(comentario));
      });
    }
  } catch (error) {
    console.error('Erro ao carregar comentários:', error);
    comentariosList.innerHTML = '<p>Erro ao carregar comentários. Tente novamente.</p>';
  }
}

adicionarComentarioBtn.addEventListener('click', async () => {
  if (!equipamentoAtual || !usuarioPerfil) {
    alert('Faça login para comentar.');
    return;
  }
  const texto = novoComentarioInput.value.trim();
  if (!texto || texto.length < 3) {
    alert('Comentário deve ter pelo menos 3 caracteres.');
    return;
  }

  try {
    const res = await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipamentoId: equipamentoAtual.id, texto }),
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao adicionar comentário');
    }

    const data = await res.json();
    console.log('✅ Comentário adicionado:', data.comentario.id);
    novoComentarioInput.value = '';  // Limpa textarea
    // Recarrega comentários no modal
    await abrirComentarios(equipamentoAtual.id);  // Chama de novo para atualizar lista
    alert('Comentário adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    alert(error.message);
  }
});

fecharComentarios.addEventListener('click', () => {
  fecharModal(modalComentarios);
  novoComentarioInput.value = '';
  equipamentoAtual = null;
});

// Logout
sairBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    if (res.ok) {
      console.log('✅ Logout realizado');
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Erro no logout:', error);
    window.location.href = '/login.html';  // Força redirecionamento
  }
});

// Inicializa ao carregar página
document.addEventListener('DOMContentLoaded', inicializar);