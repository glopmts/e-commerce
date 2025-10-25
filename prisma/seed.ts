import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const productId = "cmgs1hnla002jvu0c060igb32";

  // Primeiro cria alguns usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: "user1@example.com",
        name: "Usuário 1",
      },
    }),
    prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: "user2@example.com",
        name: "Usuário 2",
      },
    }),
    prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: "user3@example.com",
        name: "Usuário 3",
      },
    }),
    prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: "user4@example.com",
        name: "Usuário 4",
      },
    }),
    prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: "user5@example.com",
        name: "Usuário 5",
      },
    }),
  ]);

  const exampleImageUrls = [
    "https://cdn.shoppub.io/cdn-cgi/image/w=1000,h=1000,q=80,f=auto/oficinadosbits/media/uploads/produtos/foto/zyggufky/file.png",
    "https://cdn.shoppub.io/cdn-cgi/image/w=1000,h=1000,q=80,f=auto/oficinadosbits/media/uploads/produtos/foto/fdrwjzjd/file.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkoBBVq-mFy10DDYeMIJSYwyOIPPiVIKn7A&s",
  ];

  const reviewsToCreate = [
    { rating: 5, comment: "Produto excelente, superou as expectativas!" },
    { rating: 4, comment: "Muito bom, recomendo." },
    { rating: 3, comment: "Ok, atende ao propósito." },
    { rating: 4, comment: "Boa qualidade pelo preço." },
    { rating: 2, comment: "Poderia ser melhor em acabamento." },
  ];

  // Agora cria as reviews com os userIds válidos
  const createdReviews = await Promise.all(
    reviewsToCreate.map((r, idx) =>
      prisma.review.create({
        data: {
          productId,
          rating: r.rating,
          userId: users[idx].id, // Usa o ID do usuário criado
          comment: r.comment,
          images: idx < 3 ? [exampleImageUrls[idx]] : [],
        },
      })
    )
  );

  console.log(
    `👉 Criados ${users.length} usuários e ${createdReviews.length} reviews.`
  );
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
