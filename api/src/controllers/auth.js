const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.login = async (req, res) => {
  console.log("🔑 Tentativa de login com senha:", req.body.senha);
  const { senha } = req.body;
  
  if (!senha || senha.length !== 6) {
    console.log("❌ Senha inválida (tamanho)");
    return res.status(400).json({ error: "Senha inválida (deve ter 6 dígitos)" });
  }
  
  try {
    console.log("🔍 Buscando usuário com senha:", senha);
    const usuario = await prisma.usuario.findUnique({
      where: { senha },
      include: { perfil: true }
    });
    
    console.log("👤 Usuário encontrado:", usuario ? `${usuario.nome} (ID: ${usuario.id})` : "Nenhum usuário");
    
    if (!usuario || usuario.senha !== senha) {
      console.log("❌ Senha incorreta ou usuário não existe");
      return res.status(401).json({ error: "Senha incorreta" });
    }
    
    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      perfilId: usuario.perfilId,
      perfil: usuario.perfil.nome
    };
    
    console.log("✅ Login sucesso para:", usuario.nome, "perfil:", usuario.perfil.nome);
    return res.json({ 
      success: true, 
      redirect: "/index.html", 
      perfil: usuario.perfil.nome 
    });
  } catch (err) {
    console.error("❌ Erro no login (detalhes):", err.message);
    return res.status(500).json({ error: "Erro no servidor" });
  }
};

exports.getPerfil = (req, res) => {
  if (!req.session.usuario) {
    console.log("❌ Acesso negado: Não autenticado em /api/perfil");
    return res.status(401).json({ error: "Não autenticado" });
  }
  
  console.log("👤 Perfil solicitado para:", req.session.usuario.nome);
  res.json({ 
    perfil: req.session.usuario.perfil, 
    nome: req.session.usuario.nome 
  });
};

exports.autenticar = (req, res, next) => {
  if (!req.session.usuario) {
    console.log("❌ Rota protegida: Não autenticado");
    return res.status(401).json({ error: "Não autenticado. Faça login." });
  }
  
  console.log("🔒 Autenticação OK para:", req.session.usuario.nome, "em rota:", req.path);
  next();
};

exports.logout = (req, res) => {
  if (req.session.usuario) {
    console.log("👋 Logout para:", req.session.usuario.nome);
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro no logout:", err);
        return res.status(500).json({ error: "Erro no logout" });
      }
    });
  }
  
  console.log("✅ Session destruída");
  res.json({ success: true, redirect: "/login.html" });
};