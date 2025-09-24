const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.listarPorEquipamento = async (req, res) => {
  const { equipamentoId } = req.params;
  if (!req.session.usuario) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  try {
    const comentarios = await prisma.comentario.findMany({
      where: { equipamentoId: parseInt(equipamentoId) },
      include: { 
        usuario: { 
          include: { perfil: true } 
        } 
      },
      orderBy: { data: 'desc' }
    });
    console.log(`📝 Comentários para equipamento ${equipamentoId}: ${comentarios.length}`);
    res.json(comentarios);
  } catch (err) {
    console.error("Erro ao listar comentários:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

exports.criar = async (req, res) => {
  const { equipamentoId, texto } = req.body;
  const usuarioId = req.session.usuario.id;
  if (!req.session.usuario) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  if (!texto || texto.length < 3) {
    return res.status(400).json({ error: "Comentário muito curto (mínimo 3 caracteres)" });
  }
  try {
    const comentario = await prisma.comentario.create({
      data: { 
        texto, 
        equipamentoId: parseInt(equipamentoId), 
        usuarioId 
      },
      include: { 
        usuario: { 
          include: { perfil: true } 
        } 
      }
    });
    console.log("✅ Comentário criado:", texto.substring(0, 50) + "...");
    res.json({ success: true, comentario });
  } catch (err) {
    console.error("Erro ao criar comentário:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
};