import { type NextRequest, NextResponse } from "next/server";

function detectCardBrand(cardNumber: string): string {
  const sanitized = cardNumber.replace(/\s/g, "");

  // Visa
  if (/^4/.test(sanitized)) {
    return "visa";
  }

  // Mastercard
  if (/^(5[1-5]|2[2-7])/.test(sanitized)) {
    return "mastercard";
  }

  // American Express
  if (/^3[47]/.test(sanitized)) {
    return "amex";
  }

  // Diners Club
  if (/^3(?:0[0-5]|[68])/.test(sanitized)) {
    return "diners";
  }

  // Discover
  if (/^6(?:011|5)/.test(sanitized)) {
    return "discover";
  }

  // JCB
  if (/^35/.test(sanitized)) {
    return "jcb";
  }

  // Elo (Brazilian card)
  if (
    /^(4011|4312|4389|4514|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516)/.test(
      sanitized
    )
  ) {
    return "elo";
  }

  // Hipercard (Brazilian card)
  if (/^(38|60)/.test(sanitized)) {
    return "hipercard";
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const { cardNumber } = await request.json();

    if (!cardNumber || cardNumber.length < 6) {
      return NextResponse.json(
        { error: "Invalid card number" },
        { status: 400 }
      );
    }

    const brand = detectCardBrand(cardNumber);

    return NextResponse.json({
      brand,
      isValid: brand !== "unknown",
    });
  } catch (error) {
    console.error("Error detecting card brand:", error);
    return NextResponse.json(
      { error: "Failed to detect card brand" },
      { status: 500 }
    );
  }
}
