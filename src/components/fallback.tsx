import { Spinner } from "./ui/spinner";

const Fallback = () => {
  return (
    <div className="w-full h-screen max-w-7xl mx-auto">
      <div className="flex items-center justify-center w-full h-full">
        <Spinner className="size-8" />
      </div>
    </div>
  );
};

export default Fallback;
