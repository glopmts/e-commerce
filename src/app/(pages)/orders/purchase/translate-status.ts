import { OrderStatus } from "@prisma/client";

export const translateOrderStatus = (status: OrderStatus): string => {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "CONFIRMED":
      return "Confirmado";
    case "PROCESSING":
      return "Em processamento";
    case "SHIPPED":
      return "Enviado";
    case "DELIVERED":
      return "Entregue";
    case "CANCELLED":
      return "Cancelado";
    case "REFUNDED":
      return "Reembolsado";
    default:
      return status;
  }
};

export const orderStatusStyle = (status: OrderStatus): string => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "PROCESSING":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    case "SHIPPED":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "DELIVERED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "REFUNDED":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const orderStatusStyleBorde = (status: OrderStatus): string => {
  switch (status) {
    case "PENDING":
      return "border-yellow-500 border-l-4 text-yellow-800 dark:text-yellow-300";
    case "CONFIRMED":
      return "border-blue-500 border-l-4 text-blue-800 dark:text-blue-300";
    case "PROCESSING":
      return "border-indigo-500 border-l-4 text-indigo-800 dark:text-indigo-300";
    case "SHIPPED":
      return "border-orange-500 border-l-4 text-orange-800 dark:text-orange-300";
    case "DELIVERED":
      return "border-green-500 border-l-4 text-green-800 dark:text-green-300";
    case "CANCELLED":
      return "border-red-500 border-l-4 text-red-800 dark:text-red-300";
    case "REFUNDED":
      return "border-purple-500 border-l-4 text-purple-800 dark:text-purple-300";
    default:
      return "border-gray-500 border-l-4 text-gray-800 dark:text-gray-300";
  }
};
