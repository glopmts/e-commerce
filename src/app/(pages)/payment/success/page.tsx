import { Suspense } from "react";
import Fallback from "../../../../components/fallback";
import SuccessPage from "./render-sucess";

const SuccessPageRender = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <SuccessPage />
    </Suspense>
  );
};

export default SuccessPageRender;
