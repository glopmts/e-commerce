import { Check } from "lucide-react";
import { Address } from "../../types/interfaces";

type AddressProps = {
  shippingAddressId: string;
  address: Address;
};

const AddressInforCheckout = ({ shippingAddressId, address }: AddressProps) => {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center ${
          shippingAddressId === address.id
            ? "bg-blue-500 border-blue-500"
            : "border-gray-300"
        }`}
      >
        {shippingAddressId === address.id && (
          <Check className="w-3 h-3 text-white" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">
            {address.street}, {address.number}
          </span>
          {address.isDefault && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Padrão
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {address.complement && <div>Complemento: {address.complement}</div>}
          <div>Bairro: {address.neighborhood}</div>
          <div>
            {address.city} - {address.state}, {address.zipCode}
          </div>
          <div>{address.country}</div>
        </div>
      </div>
    </div>
  );
};

export default AddressInforCheckout;
