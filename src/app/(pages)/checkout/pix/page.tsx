import { Suspense } from "react";
import { Spinner } from "../../../../components/ui/spinner";
import PixCheckout from "./render-pix";

const PixPage = () => {
  return (
    <Suspense fallback={<Spinner className="size-5" />}>
      <PixCheckout />
    </Suspense>
  );
};

export default PixPage;
