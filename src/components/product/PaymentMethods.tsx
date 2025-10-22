"use client";

const ListInfo = {
  creditCard: [
    {
      label: "Cartão de Crédito",
    },
    {
      id: 1,
      image:
        "https://http2.mlstatic.com/storage/logos-api-admin/ddf23a60-f3bd-11eb-a186-1134488bf456-m.svg",
    },
    {
      id: 2,
      image:
        "https://http2.mlstatic.com/storage/logos-api-admin/bb7c7bb0-adec-11f0-92e6-59fb0bcb38c2-m.svg",
    },
    {
      id: 3,
      image:
        "https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg",
    },
    {
      id: 4,
      image:
        "https://http2.mlstatic.com/storage/logos-api-admin/9cf818e0-723a-11f0-a459-cf21d0937aeb-m.svg",
    },
  ],
  pix: [
    { label: "Pix" },
    {
      id: 1,
      image:
        "https://http2.mlstatic.com/storage/logos-api-admin/f99fcca0-f3bd-11eb-9984-b7076edb0bb7-m.svg",
    },
  ],
  boleto: [
    { label: "Boleto Bancário" },
    {
      id: 1,
      image:
        "https://blog.br.tkelevator.com/wp-content/uploads/2023/04/boleto-logo.png",
    },
  ],
};

const PaymentMethods = () => {
  return (
    <div className="w-full  h-full border p-6 rounded-lg shadow-sm ">
      <div className="pb-6">
        <h2 className="text-xl font-semibold ">Métodos de Pagamento</h2>
      </div>
      <div className="flex flex-col gap-4">
        {Object.entries(ListInfo).map(([key, methods]) => (
          <div key={key} className="flex flex-col gap-2">
            <h3 className="text-lg font-medium ">{methods[0].label}</h3>
            <div className="flex items-center gap-4">
              {methods.slice(1).map((method) => (
                <div key={method.id} className="w-12 h-8 relative">
                  <img
                    src={method.image}
                    alt={method.label || "Payment Method"}
                    className="object-contain w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
