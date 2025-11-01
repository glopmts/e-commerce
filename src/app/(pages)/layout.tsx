import Header from "../../components/header/Header";

const LayoutMain = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="w-full min-h-screen h-full">
      <Header />
      {children}
    </div>
  );
};

export default LayoutMain;
