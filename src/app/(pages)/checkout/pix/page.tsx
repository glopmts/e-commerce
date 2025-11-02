import { Suspense } from "react";
import Fallback from "../../../../components/fallback";
import PixCheckout from "./render-pix";

const PixPage = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <PixCheckout />
    </Suspense>
  );
};

export default PixPage;
