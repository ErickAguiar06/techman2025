const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  try {
    const equipamentos = await prisma.equipamento.findMany({
      where: { ativo: true },
      orderBy: { data: 'desc' }
    });
    res.json(equipamentos);
  } catch (err) {
    console.error("Erro ao listar equipamentos:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

exports.criar = async (req, res) => {
  const { nome, descricao, imagem, ativo = true } = req.body;
  if (req.session.usuario?.perfil !== "Administrador") {
    return res.status(403).json({ error: "Apenas admin pode criar" });
  }
  if (!nome || !descricao) {
    return res.status(400).json({ error: "Nome e descrição são obrigatórios" });
  }
  try {
    const novo = await prisma.equipamento.create({
      data: { 
        nome, 
        descricao, 
        imagem: imagem || null, 
        ativo 
      }
    });
    console.log("✅ Equipamento criado:", novo.nome);
    res.json({ success: true, equipamento: novo });
  } catch (err) {
    console.error("Erro ao criar equipamento:", err);
    res.status(500).json({ error: "Erro ao criar" });
  }
};

exports.excluir = async (req, res) => {
  const { id } = req.params;
  if (req.session.usuario?.perfil !== "Administrador") {
    return res.status(403).json({ error: "Apenas admin pode excluir" });
  }
  try {
    await prisma.comentario.deleteMany({ where: { equipamentoId: parseInt(id) } });
    await prisma.equipamento.delete({ where: { id: parseInt(id) } });
    console.log("✅ Equipamento excluído:", id);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir equipamento:", err);
    res.status(500).json({ error: "Erro ao excluir" });
  }
};