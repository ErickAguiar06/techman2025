const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpando dados antigos para evitar conflitos...");
  await prisma.comentario.deleteMany({});
  await prisma.equipamento.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.perfil.deleteMany({});
  console.log("✅ Dados antigos limpos.");

  const perfis = await prisma.perfil.createMany({
    data: [
      { id: 1, nome: "Comum" },
      { id: 2, nome: "Administrador" },
      { id: 3, nome: "Técnico" },
      { id: 4, nome: "Gerente" }
    ],
    skipDuplicates: true
  });
  console.log(`✅ Perfis criados/atualizados: ${perfis.count || 4} itens.`);

  const usuarios = await prisma.usuario.createMany({
    data: [
      { id: 1, nome: "Usuário Comum", senha: "111111", perfilId: 1 },
      { id: 2, nome: "Admin TechMan", senha: "212121", perfilId: 2 },
      { id: 3, nome: "Gerente João", senha: "414141", perfilId: 4 },
      { id: 4, nome: "Técnico Maria", senha: "313131", perfilId: 3 }
    ],
    skipDuplicates: true
  });
  console.log(`✅ Usuários criados/atualizados: ${usuarios.count || 4} itens (com nomes!).`);

  const equipamentos = await prisma.equipamento.createMany({
    data: [
      {
        id: 1,
        nome: "Torno Mecânico 500mm Modelo BV20L 220V - TTM520 - Tander",
        imagem: "Torno_Mecanico_500mm.png",
        descricao: "O Torno Mecânico Tander TTM520 é uma ferramenta utilizada por vários profissionais...",
        ativo: true,
        data: new Date("2019-10-01T14:54:20.873Z")
      },
      {
        id: 2,
        nome: "Processador Intel Core i9-7920X Skylake",
        imagem: "Intel_Core_i9.png",
        descricao: "Com esse processador inovador e incrível você desfruta ao máximo...",
        ativo: true,
        data: new Date("2019-10-01T15:00:20.873Z")
      },
      {
        id: 3,
        nome: "Monitor Dell U2518D UltraSharp 25\"",
        imagem: "Monitor_Dell.png",
        descricao: "Dê vida ao seu trabalho com uma tela de 25 polegadas quase sem bordas...",
        ativo: false,
        data: new Date("2018-10-01T10:00:20.000Z")
      },
      {
        id: 4,
        nome: "Mouse Gamer Razer Deathadder Essential Óptico 5 Botões 4G 6400 DPI",
        imagem: "Mouse_Razer.png",
        descricao: "Nada melhor do que um mouse gamer com tecnologia de ponta...",
        ativo: true,
        data: new Date("2017-10-01T09:00:20.000Z")
      },
      {
        id: 5,
        nome: "All-in-One Media Keyboard",
        imagem: "Teclado_Microsoft.png",
        descricao: "O All-in-One Media Keyboard é o dispositivo ideal para sua sala...",
        ativo: false,
        data: new Date("2017-10-01T13:00:00.000Z")
      }
    ],
    skipDuplicates: true
  });
  console.log(`✅ Equipamentos criados/atualizados: ${equipamentos.count || 5} itens (3 ativos).`);

  const comentarios = await prisma.comentario.createMany({
    data: [
      { texto: "Deverá fazer o download do aplicativo da Razer...", equipamentoId: 2, usuarioId: 4, data: new Date("2020-09-07T18:00:00Z") },
      { texto: "Problema de aquecimento no processador após 1 ano de uso.", equipamentoId: 2, usuarioId: 2, data: new Date("2020-05-04T10:30:00Z") },
      { texto: "Problema de aquecimento no processador após 3 anos de uso.", equipamentoId: 3, usuarioId: 4, data: new Date("2021-03-04T15:30:00Z") }
    ],
    skipDuplicates: true
  });
  console.log(`✅ Comentários criados/atualizados: ${comentarios.count || 3} itens.`);

  console.log("✅ Seed inserido com sucesso!");
  console.log("👤 Teste login: Senha '212121' (Admin), '111111' (Comum).");
  console.log("🛠️  Equipamentos ativos: IDs 1,2,4 (Torno, Intel, Mouse).");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });