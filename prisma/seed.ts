import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Categories
  console.log("📦 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Roupas",
        slug: "roupas",
        description: "Roupas masculinas e femininas",
        image: "/diverse-clothing-rack.png",
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Calçados",
        slug: "calcados",
        description: "Tênis, sapatos e sandálias",
        image: "/assorted-shoes.png",
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Acessórios",
        slug: "acessorios",
        description: "Bolsas, relógios e bijuterias",
        image: "/fashion-accessories-flatlay.png",
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Eletrônicos",
        slug: "eletronicos",
        description: "Smartphones, tablets e gadgets",
        image: "/electronics-components.png",
        isActive: true,
        sortOrder: 4,
      },
    }),
  ]);

  // Create Sizes
  console.log("📏 Creating sizes...");
  const sizes = await Promise.all([
    prisma.size.create({
      data: { name: "PP", value: "Extra Pequeno", sortOrder: 1 },
    }),
    prisma.size.create({ data: { name: "P", value: "Pequeno", sortOrder: 2 } }),
    prisma.size.create({ data: { name: "M", value: "Médio", sortOrder: 3 } }),
    prisma.size.create({ data: { name: "G", value: "Grande", sortOrder: 4 } }),
    prisma.size.create({
      data: { name: "GG", value: "Extra Grande", sortOrder: 5 },
    }),
    prisma.size.create({ data: { name: "38", value: "38", sortOrder: 6 } }),
    prisma.size.create({ data: { name: "39", value: "39", sortOrder: 7 } }),
    prisma.size.create({ data: { name: "40", value: "40", sortOrder: 8 } }),
    prisma.size.create({ data: { name: "41", value: "41", sortOrder: 9 } }),
    prisma.size.create({ data: { name: "42", value: "42", sortOrder: 10 } }),
  ]);

  // Create Colors
  console.log("🎨 Creating colors...");
  const colors = await Promise.all([
    prisma.color.create({
      data: { name: "Preto", value: "#000000", sortOrder: 1 },
    }),
    prisma.color.create({
      data: { name: "Branco", value: "#FFFFFF", sortOrder: 2 },
    }),
    prisma.color.create({
      data: { name: "Vermelho", value: "#FF0000", sortOrder: 3 },
    }),
    prisma.color.create({
      data: { name: "Azul", value: "#0000FF", sortOrder: 4 },
    }),
    prisma.color.create({
      data: { name: "Verde", value: "#00FF00", sortOrder: 5 },
    }),
    prisma.color.create({
      data: { name: "Amarelo", value: "#FFFF00", sortOrder: 6 },
    }),
    prisma.color.create({
      data: { name: "Cinza", value: "#808080", sortOrder: 7 },
    }),
    prisma.color.create({
      data: { name: "Rosa", value: "#FFC0CB", sortOrder: 8 },
    }),
  ]);

  // Create Payment Methods
  console.log("💳 Creating payment methods...");
  await Promise.all([
    prisma.paymentMethod.create({
      data: {
        name: "Cartão de Crédito",
        description: "Pagamento com cartão de crédito",
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.paymentMethod.create({
      data: {
        name: "PIX",
        description: "Pagamento instantâneo via PIX",
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.paymentMethod.create({
      data: {
        name: "Boleto",
        description: "Pagamento via boleto bancário",
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);

  // Create Products - Roupas
  console.log("👕 Creating clothing products...");
  const camisetaBasica = await prisma.product.create({
    data: {
      title: "Camiseta Básica Premium",
      description: "Camiseta básica de algodão premium, confortável e durável",
      price: 79.9,
      comparePrice: 99.9,
      costPrice: 35.0,
      content:
        "Camiseta confeccionada em 100% algodão premium. Modelagem confortável e versátil para o dia a dia.",
      slug: "camiseta-basica-premium",
      barcode: "7891234567890",
      weight: 0.2,
      height: 2.0,
      width: 30.0,
      depth: 25.0,
      stock: 150,
      trackStock: true,
      isActive: true,
      isFeatured: true,
      categoryId: categories[0].id,
      images: {
        create: [
          {
            url: "/basic-tshirt-black.jpg",
            altText: "Camiseta Básica Premium - Frente",
            sortOrder: 1,
            isPrimary: true,
          },
          {
            url: "/basic-tshirt-back.jpg",
            altText: "Camiseta Básica Premium - Costas",
            sortOrder: 2,
            isPrimary: false,
          },
        ],
      },
      attributes: {
        create: [
          { name: "Material", value: "100% Algodão" },
          { name: "Marca", value: "Premium Basics" },
          { name: "Origem", value: "Brasil" },
        ],
      },
      variants: {
        create: [
          {
            name: "P - Preto",
            sku: "CAM-BAS-P-PRE",
            price: 79.9,
            stock: 30,
            isActive: true,
            sizeId: sizes[1].id,
            colorId: colors[0].id,
          },
          {
            name: "M - Preto",
            sku: "CAM-BAS-M-PRE",
            price: 79.9,
            stock: 40,
            isActive: true,
            sizeId: sizes[2].id,
            colorId: colors[0].id,
          },
          {
            name: "G - Preto",
            sku: "CAM-BAS-G-PRE",
            price: 79.9,
            stock: 35,
            isActive: true,
            sizeId: sizes[3].id,
            colorId: colors[0].id,
          },
          {
            name: "P - Branco",
            sku: "CAM-BAS-P-BRA",
            price: 79.9,
            stock: 25,
            isActive: true,
            sizeId: sizes[1].id,
            colorId: colors[1].id,
          },
          {
            name: "M - Branco",
            sku: "CAM-BAS-M-BRA",
            price: 79.9,
            stock: 20,
            isActive: true,
            sizeId: sizes[2].id,
            colorId: colors[1].id,
          },
        ],
      },
    },
  });

  const calcaJeans = await prisma.product.create({
    data: {
      title: "Calça Jeans Slim Fit",
      description: "Calça jeans com modelagem slim fit moderna",
      price: 189.9,
      comparePrice: 249.9,
      costPrice: 85.0,
      content:
        "Calça jeans com modelagem slim fit, confeccionada em denim de alta qualidade. Perfeita para looks casuais e elegantes.",
      slug: "calca-jeans-slim-fit",
      barcode: "7891234567891",
      weight: 0.6,
      height: 3.0,
      width: 35.0,
      depth: 30.0,
      stock: 80,
      trackStock: true,
      isActive: true,
      isFeatured: true,
      categoryId: categories[0].id,
      images: {
        create: [
          {
            url: "/slim-fit-jeans.png",
            altText: "Calça Jeans Slim Fit",
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      attributes: {
        create: [
          { name: "Material", value: "98% Algodão, 2% Elastano" },
          { name: "Marca", value: "Denim Co." },
          { name: "Modelagem", value: "Slim Fit" },
        ],
      },
      variants: {
        create: [
          {
            name: "38 - Azul",
            sku: "CAL-JEA-38-AZU",
            price: 189.9,
            stock: 15,
            isActive: true,
            sizeId: sizes[5].id,
            colorId: colors[3].id,
          },
          {
            name: "40 - Azul",
            sku: "CAL-JEA-40-AZU",
            price: 189.9,
            stock: 20,
            isActive: true,
            sizeId: sizes[7].id,
            colorId: colors[3].id,
          },
          {
            name: "42 - Azul",
            sku: "CAL-JEA-42-AZU",
            price: 189.9,
            stock: 18,
            isActive: true,
            sizeId: sizes[9].id,
            colorId: colors[3].id,
          },
          {
            name: "40 - Preto",
            sku: "CAL-JEA-40-PRE",
            price: 189.9,
            stock: 12,
            isActive: true,
            sizeId: sizes[7].id,
            colorId: colors[0].id,
          },
        ],
      },
    },
  });

  // Create Products - Calçados
  console.log("👟 Creating footwear products...");
  const tenisEsportivo = await prisma.product.create({
    data: {
      title: "Tênis Esportivo Running Pro",
      description: "Tênis esportivo de alta performance para corrida",
      price: 349.9,
      comparePrice: 449.9,
      costPrice: 150.0,
      content:
        "Tênis desenvolvido para corrida com tecnologia de amortecimento avançado. Solado em borracha de alta aderência e cabedal respirável.",
      slug: "tenis-esportivo-running-pro",
      barcode: "7891234567892",
      weight: 0.8,
      height: 12.0,
      width: 30.0,
      depth: 20.0,
      stock: 60,
      trackStock: true,
      isActive: true,
      isFeatured: true,
      categoryId: categories[1].id,
      images: {
        create: [
          {
            url: "/running-shoes-black.jpg",
            altText: "Tênis Esportivo Running Pro",
            sortOrder: 1,
            isPrimary: true,
          },
          {
            url: "/running-shoes-side.jpg",
            altText: "Tênis Esportivo - Vista Lateral",
            sortOrder: 2,
            isPrimary: false,
          },
        ],
      },
      attributes: {
        create: [
          { name: "Material", value: "Mesh Respirável" },
          { name: "Marca", value: "SportMax" },
          { name: "Tecnologia", value: "Air Cushion" },
        ],
      },
      variants: {
        create: [
          {
            name: "39 - Preto",
            sku: "TEN-RUN-39-PRE",
            price: 349.9,
            stock: 10,
            isActive: true,
            sizeId: sizes[6].id,
            colorId: colors[0].id,
          },
          {
            name: "40 - Preto",
            sku: "TEN-RUN-40-PRE",
            price: 349.9,
            stock: 15,
            isActive: true,
            sizeId: sizes[7].id,
            colorId: colors[0].id,
          },
          {
            name: "41 - Preto",
            sku: "TEN-RUN-41-PRE",
            price: 349.9,
            stock: 12,
            isActive: true,
            sizeId: sizes[8].id,
            colorId: colors[0].id,
          },
          {
            name: "40 - Branco",
            sku: "TEN-RUN-40-BRA",
            price: 349.9,
            stock: 8,
            isActive: true,
            sizeId: sizes[7].id,
            colorId: colors[1].id,
          },
        ],
      },
    },
  });

  // Create Products - Acessórios
  console.log("👜 Creating accessory products...");
  const bolsaCouro = await prisma.product.create({
    data: {
      title: "Bolsa de Couro Executiva",
      description: "Bolsa executiva em couro legítimo",
      price: 459.9,
      comparePrice: 599.9,
      costPrice: 200.0,
      content:
        "Bolsa executiva confeccionada em couro legítimo de alta qualidade. Design elegante e funcional com múltiplos compartimentos.",
      slug: "bolsa-couro-executiva",
      barcode: "7891234567893",
      weight: 1.2,
      height: 30.0,
      width: 40.0,
      depth: 15.0,
      stock: 35,
      trackStock: true,
      isActive: true,
      isFeatured: false,
      categoryId: categories[2].id,
      images: {
        create: [
          {
            url: "/leather-bag-black.jpg",
            altText: "Bolsa de Couro Executiva",
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      attributes: {
        create: [
          { name: "Material", value: "Couro Legítimo" },
          { name: "Marca", value: "Luxury Bags" },
          { name: "Forro", value: "Tecido Premium" },
        ],
      },
      variants: {
        create: [
          {
            name: "Único - Preto",
            sku: "BOL-COU-UN-PRE",
            price: 459.9,
            stock: 15,
            isActive: true,
            colorId: colors[0].id,
          },
          {
            name: "Único - Marrom",
            sku: "BOL-COU-UN-MAR",
            price: 459.9,
            stock: 12,
            isActive: true,
            colorId: colors[6].id,
          },
        ],
      },
    },
  });

  const relogioDigital = await prisma.product.create({
    data: {
      title: "Relógio Digital Smartwatch",
      description: "Smartwatch com monitor de atividades e notificações",
      price: 899.9,
      comparePrice: 1199.9,
      costPrice: 400.0,
      content:
        "Smartwatch com tela AMOLED, monitor cardíaco, GPS integrado e resistência à água. Compatível com iOS e Android.",
      slug: "relogio-digital-smartwatch",
      barcode: "7891234567894",
      weight: 0.3,
      height: 5.0,
      width: 15.0,
      depth: 10.0,
      stock: 45,
      trackStock: true,
      isActive: true,
      isFeatured: true,
      categoryId: categories[2].id,
      images: {
        create: [
          {
            url: "/smartwatch-black.jpg",
            altText: "Relógio Digital Smartwatch",
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      attributes: {
        create: [
          { name: "Marca", value: "TechWatch" },
          { name: "Tela", value: 'AMOLED 1.4"' },
          { name: "Bateria", value: "Até 7 dias" },
          { name: "Resistência", value: "IP68" },
        ],
      },
      variants: {
        create: [
          {
            name: "Único - Preto",
            sku: "REL-SMA-UN-PRE",
            price: 899.9,
            stock: 20,
            isActive: true,
            colorId: colors[0].id,
          },
          {
            name: "Único - Prata",
            sku: "REL-SMA-UN-PRA",
            price: 899.9,
            stock: 15,
            isActive: true,
            colorId: colors[6].id,
          },
        ],
      },
    },
  });

  // Create Products - Eletrônicos
  console.log("📱 Creating electronics products...");
  const foneBluetoothPremium = await prisma.product.create({
    data: {
      title: "Fone de Ouvido Bluetooth Premium",
      description: "Fone bluetooth com cancelamento de ruído ativo",
      price: 599.9,
      comparePrice: 799.9,
      costPrice: 250.0,
      content:
        "Fone de ouvido over-ear com cancelamento de ruído ativo, áudio Hi-Fi e bateria de longa duração. Perfeito para música e trabalho.",
      slug: "fone-bluetooth-premium",
      barcode: "7891234567895",
      weight: 0.4,
      height: 20.0,
      width: 18.0,
      depth: 8.0,
      stock: 55,
      trackStock: true,
      isActive: true,
      isFeatured: true,
      categoryId: categories[3].id,
      images: {
        create: [
          {
            url: "/bluetooth-headphones.png",
            altText: "Fone de Ouvido Bluetooth Premium",
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      attributes: {
        create: [
          { name: "Marca", value: "AudioMax" },
          { name: "Conectividade", value: "Bluetooth 5.0" },
          { name: "Bateria", value: "Até 30 horas" },
          { name: "Cancelamento de Ruído", value: "ANC Ativo" },
        ],
      },
      variants: {
        create: [
          {
            name: "Único - Preto",
            sku: "FON-BLU-UN-PRE",
            price: 599.9,
            stock: 25,
            isActive: true,
            colorId: colors[0].id,
          },
          {
            name: "Único - Branco",
            sku: "FON-BLU-UN-BRA",
            price: 599.9,
            stock: 20,
            isActive: true,
            colorId: colors[1].id,
          },
        ],
      },
    },
  });

  const mouseGamer = await prisma.product.create({
    data: {
      title: "Mouse Gamer RGB Pro",
      description: "Mouse gamer com sensor óptico de alta precisão",
      price: 249.9,
      comparePrice: 329.9,
      costPrice: 100.0,
      content:
        "Mouse gamer com sensor óptico de 16.000 DPI, iluminação RGB personalizável e 8 botões programáveis. Ideal para jogos competitivos.",
      slug: "mouse-gamer-rgb-pro",
      barcode: "7891234567896",
      weight: 0.15,
      height: 5.0,
      width: 12.0,
      depth: 7.0,
      stock: 70,
      trackStock: true,
      isActive: true,
      isFeatured: false,
      categoryId: categories[3].id,
      images: {
        create: [
          {
            url: "/gaming-mouse-rgb.jpg",
            altText: "Mouse Gamer RGB Pro",
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      attributes: {
        create: [
          { name: "Marca", value: "GameTech" },
          { name: "Sensor", value: "Óptico 16.000 DPI" },
          { name: "Botões", value: "8 Programáveis" },
          { name: "Iluminação", value: "RGB 16.8M cores" },
        ],
      },
      variants: {
        create: [
          {
            name: "Único - Preto",
            sku: "MOU-GAM-UN-PRE",
            price: 249.9,
            stock: 35,
            isActive: true,
            colorId: colors[0].id,
          },
          {
            name: "Único - Branco",
            sku: "MOU-GAM-UN-BRA",
            price: 249.9,
            stock: 25,
            isActive: true,
            colorId: colors[1].id,
          },
        ],
      },
    },
  });

  // Create Discounts
  console.log("🎁 Creating discounts...");
  const discount10 = await prisma.discount.create({
    data: {
      name: "Desconto 10% - Primeira Compra",
      description: "Desconto de 10% para primeira compra",
      code: "PRIMEIRA10",
      type: "PERCENTAGE",
      value: 10,
      minAmount: 100,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      isActive: true,
      usageLimit: 1000,
      usedCount: 0,
    },
  });

  const discount50 = await prisma.discount.create({
    data: {
      name: "Desconto R$ 50 - Compras acima de R$ 300",
      description: "Desconto fixo de R$ 50 para compras acima de R$ 300",
      code: "DESCONTO50",
      type: "FIXED_AMOUNT",
      value: 50,
      minAmount: 300,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      isActive: true,
      usageLimit: 500,
      usedCount: 0,
    },
  });

  // Associate discounts with products
  await prisma.discountProduct.createMany({
    data: [
      { discountId: discount10.id, productId: camisetaBasica.id },
      { discountId: discount10.id, productId: calcaJeans.id },
      { discountId: discount50.id, productId: tenisEsportivo.id },
      { discountId: discount50.id, productId: foneBluetoothPremium.id },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log(`
  📊 Summary:
  - ${categories.length} categories created
  - ${sizes.length} sizes created
  - ${colors.length} colors created
  - 7 products created with variants
  - 2 discounts created
  - 3 payment methods created
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
