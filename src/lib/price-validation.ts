import { db } from "./prisma";

export interface PriceValidationResult {
  isValid: boolean;
  calculatedTotal: number;
  errors: string[];
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    dbPrice: number;
    priceMatch: boolean;
  }>;
}

export async function validatePrices(
  frontendItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>,
  frontendTotal: number,
  paymentMethodId: string
): Promise<PriceValidationResult & { expectedTotalWithPixDiscount: number }> {
  console.log("Validando preços - paymentMethodId:", paymentMethodId);

  // Verificar se é pagamento PIX - CORREÇÃO AQUI
  let isPixPayment = false;

  if (paymentMethodId === "pix" || paymentMethodId === "PIX") {
    isPixPayment = true;
  } else {
    // Buscar no banco apenas se não for identificado como PIX pelo ID
    const paymentMethod = await db.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    isPixPayment = paymentMethod?.typePayment === "PIX";
  }

  console.log("É pagamento PIX?", isPixPayment);

  const pixDiscountRate = 0.1; // 10% de desconto

  const productIds = frontendItems.map((item) => item.id);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      title: true,
      price: true,
      stock: true,
    },
  });

  let originalTotal = 0;
  let expectedTotalWithDiscount = 0;
  const errors: string[] = [];
  const items: PriceValidationResult["items"] = [];

  for (const frontendItem of frontendItems) {
    const dbProduct = dbProducts.find((p) => p.id === frontendItem.id);

    if (!dbProduct) {
      errors.push(`Produto ${frontendItem.id} não encontrado`);
      continue;
    }

    const itemOriginalSubtotal = dbProduct.price * frontendItem.quantity;
    originalTotal += itemOriginalSubtotal;

    // CALCULAR COM DESCONTO PIX SE APLICÁVEL
    const itemDiscountedSubtotal = isPixPayment
      ? itemOriginalSubtotal * (1 - pixDiscountRate)
      : itemOriginalSubtotal;

    expectedTotalWithDiscount += itemDiscountedSubtotal;

    const priceMatch = frontendItem.price === dbProduct.price;

    if (!priceMatch) {
      errors.push(
        `Preço alterado: "${dbProduct.title}" - Frontend: R$ ${frontendItem.price} vs Banco: R$ ${dbProduct.price}`
      );
    }

    if (dbProduct.stock && dbProduct.stock < frontendItem.quantity) {
      errors.push(
        `Estoque insuficiente: "${dbProduct.title}" - Disponível: ${dbProduct.stock}, Solicitado: ${frontendItem.quantity}`
      );
    }

    items.push({
      id: frontendItem.id,
      name: frontendItem.name,
      price: frontendItem.price,
      quantity: frontendItem.quantity,
      subtotal: itemOriginalSubtotal,
      dbPrice: dbProduct.price,
      priceMatch,
    });
  }

  // DEBUG: Log dos cálculos
  console.log("DEBUG - Cálculos de validação:", {
    frontendTotal,
    originalTotal,
    expectedTotalWithDiscount,
    isPixPayment,
    itemsCount: frontendItems.length,
    items: frontendItems.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    })),
  });

  const tolerance = 0.01;
  const totalMatch =
    Math.abs(frontendTotal - expectedTotalWithDiscount) <= tolerance;

  if (!totalMatch) {
    errors.push(
      `Total inválido: Frontend R$ ${frontendTotal} vs Esperado com ${
        isPixPayment ? "desconto PIX" : "sem desconto"
      } R$ ${expectedTotalWithDiscount} (diferença: R$ ${Math.abs(
        frontendTotal - expectedTotalWithDiscount
      ).toFixed(2)})`
    );
  }

  return {
    isValid: errors.length === 0,
    calculatedTotal: originalTotal,
    expectedTotalWithPixDiscount: expectedTotalWithDiscount,
    errors,
    items,
  };
}