const senhaDisplay = document.getElementById('senhaDisplay');
const teclas = document.querySelectorAll('.tecla[data-num]');
const entrarBtn = document.getElementById('entrar');
const limparBtn = document.getElementById('clear');
const mensagemErro = document.getElementById('mensagemErro');

let senha = "";

function atualizarDisplay() {
  senhaDisplay.textContent = '*'.repeat(senha.length);
  if (senha.length === 6) {
    entrarBtn.classList.add('ativo');
  } else {
    entrarBtn.classList.remove('ativo');
  }
}

teclas.forEach(tecla => {
  tecla.addEventListener('click', () => {
    if (senha.length < 6) {
      senha += tecla.getAttribute('data-num');
      atualizarDisplay();
    }
  });
});

limparBtn.addEventListener('click', () => {
  senha = "";
  atualizarDisplay();
  mensagemErro.style.display = "none";
});

entrarBtn.addEventListener('click', async () => {
  if (senha.length === 6) {
    try {
      console.log("🔄 Enviando fetch para /api/login com senha:", senha); 
      const res = await fetch('/api/login', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
        credentials: 'include'
      });
      console.log("📡 Resposta do server:", res.status, res.statusText);  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro do server:", res.status, errorText);
        let data;
        try {
          data = JSON.parse(errorText);
          mensagemErro.textContent = data.error || "Erro no servidor.";
        } catch {
          mensagemErro.textContent = `Erro ${res.status}: Servidor retornou página de erro (verifique rota).`;
        }
        mensagemErro.style.display = "block";
        senha = "";
        atualizarDisplay();
        return;
      }
      const data = await res.json();
      console.log("Login sucesso:", data);
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Erro de conexão:", error);
      mensagemErro.textContent = "Erro de conexão com o servidor. Verifique o console.";
      mensagemErro.style.display = "block";
      senha = "";
      atualizarDisplay();
    }
  }
});
atualizarDisplay();