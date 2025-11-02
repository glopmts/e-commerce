import { Suspense } from "react";
import Fallback from "../../../../components/fallback";
import CardPaymentPage from "./render-page";

const CardPage = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <CardPaymentPage />
    </Suspense>
  );
};

export default CardPage;
