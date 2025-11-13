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
  frontendItems: Array<{ id: string; name: string; price: number; quantity: number }>,
  frontendTotal: number
): Promise<PriceValidationResult> {
  const productIds = frontendItems.map(item => item.id);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      title: true,
      price: true,
      stock: true,
    },
  });

  let calculatedTotal = 0;
  const errors: string[] = [];
  const items: PriceValidationResult['items'] = [];

  for (const frontendItem of frontendItems) {
    const dbProduct = dbProducts.find(p => p.id === frontendItem.id);
    
    if (!dbProduct) {
      errors.push(`Produto ${frontendItem.id} não encontrado`);
      continue;
    }

    const itemSubtotal = dbProduct.price * frontendItem.quantity;
    calculatedTotal += itemSubtotal;
    
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
      subtotal: itemSubtotal,
      dbPrice: dbProduct.price,
      priceMatch,
    });
  }

  const tolerance = 0.01;
  const totalMatch = Math.abs(frontendTotal - calculatedTotal) <= tolerance;
  
  if (!totalMatch) {
    errors.push(
      `Total inválido: Frontend R$ ${frontendTotal} vs Calculado R$ ${calculatedTotal} (diferença: R$ ${Math.abs(frontendTotal - calculatedTotal).toFixed(2)})`
    );
  }

  return {
    isValid: errors.length === 0,
    calculatedTotal,
    errors,
    items,
  };
}