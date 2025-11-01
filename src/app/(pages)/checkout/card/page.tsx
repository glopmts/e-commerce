import { Suspense } from "react";
import { Spinner } from "../../../../components/ui/spinner";
import CardPaymentPage from "./render-page";

const CardPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <CardPaymentPage />
    </Suspense>
  );
};

export default CardPage;
