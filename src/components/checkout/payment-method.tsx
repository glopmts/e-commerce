import { PaymentMethodEnum } from "@prisma/client";
import { Check } from "lucide-react";
import Image from "next/image";
import { PaymentMethod } from "../../types/interfaces";

type PaymentMethodProps = {
  paymentMethodId: string;
  filteredPaymentMethods: PaymentMethod[];
  handlePaymentMethodSelect: (id: string) => void;
};

const getPaymentMethodDescription = (type: PaymentMethodEnum): string => {
  const descriptions = {
    [PaymentMethodEnum.PIX]: "Pagamento instantâneo e seguro",
    [PaymentMethodEnum.CARD]: "Parcelamento em até 12x",
    [PaymentMethodEnum.TICKET]: "Pague em qualquer agência bancária",
  };
  return descriptions[type] || "Método de pagamento seguro";
};

const PaymentMethodCheckout = ({
  filteredPaymentMethods,
  paymentMethodId,
  handlePaymentMethodSelect,
}: PaymentMethodProps) => {
  return (
    <div className="space-y-3">
      {filteredPaymentMethods.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum método de pagamento disponível
          </p>
        </div>
      ) : (
        filteredPaymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethodId === method.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handlePaymentMethodSelect(method.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 relative flex-shrink-0">
                <Image
                  src={method.icon}
                  alt={method.name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/48";
                  }}
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{method.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getPaymentMethodDescription(method.typePayment)}
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  paymentMethodId === method.id
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMethodId === method.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PaymentMethodCheckout;
