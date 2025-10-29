type PurchaseData = {
  email: string;
  name: string;
  orderId: string;
  purchaseDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
};

const siteBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const generatePurchaseConfirmationEmail = (
  purchaseData: PurchaseData
) => {
  const purchaseLink = `${siteBaseUrl}/profile/purchase/details/${purchaseData.orderId}`;

  const itemsHtml = purchaseData.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return {
    from: process.env.EMAIL_FROM || "noreply@yourstore.com",
    to: purchaseData.email,
    subject: `Your Purchase Confirmation - Order #${purchaseData.orderId}`,
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Obrigado por sua compra, ${
          purchaseData.name
        }!</h2>
        <p>Seu pedido foi recebido e está sendo processado. Aqui estão os detalhes:</p>
        
        <h3 style="color: #444;">Resumo do Pedido</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Produto</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Quantidade</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Preço</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <p><strong>Número do Pedido:</strong> ${purchaseData.orderId}</p>
        <p><strong>Data:</strong> ${purchaseData.purchaseDate}</p>
        <p><strong>Valor Total:</strong> R$${purchaseData.totalAmount.toFixed(
          2
        )}</p>
        
        <p>Você pode acompanhar os detalhes do seu pedido clicando no link abaixo:</p>
        <p>
          <a href="${purchaseLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Ver Meu Pedido
          </a>
        </p>
        
        <p>Caso tenha qualquer dúvida sobre sua compra, entre em contato com nosso atendimento.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">
          Este e-mail é automático. Por favor, não responda diretamente a esta mensagem.
        </p>
      </div>
    `,
  };
};
