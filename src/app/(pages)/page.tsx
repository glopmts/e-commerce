import AllProducts from "@/components/home/all-products";
import BannerHome from "@/components/home/banner-home";
import CategoryHome from "@/components/home/categorys-home";
import NewsProducts from "@/components/home/news-products";
import CategoryProducts from "@/components/home/products-category";

export default async function DashboardPage() {
  return (
    <div className="min-h-screen relative h-full w-full">
      <BannerHome />
      <div className="mx-auto max-w-7xl p-2 h-full w-full">
        <div className="w-full">
          <NewsProducts />
        </div>
        <div className="w-full h-auto">
          <CategoryHome />
        </div>
        <div className="w-full h-auto">
          <CategoryProducts />
        </div>
        <div className="w-full h-auto">
          <AllProducts />
        </div>
      </div>
    </div>
  );
}
