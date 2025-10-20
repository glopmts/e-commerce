"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/interfaces";

type PropsProduct = {
  userId: string | null;
  isSave?: boolean;
  product: Product;
};

const CardProduct = ({ userId, isSave, product }: PropsProduct) => {
  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer">
      <Link
        href={`/product/${product.slug}`}
        className="w-full h-full flex flex-col gap-2"
      >
        <div>
          <div className="relative w-full h-49 md:h-58 overflow-hidden rounded-md">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-sm text-muted-foreground">
                  {product.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-full *:px-2 pb-4 flex flex-col">
          <div className="mt-2">
            <div className="">
              <h1 className="text-base font-semibold line-clamp-2">
                {product.title}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                {product.description ? product.description : "Sem descrição"}
              </p>
            </div>
            {(() => {
              const price = product.price ?? null;
              const discountPercent = price ? (price >= 100 ? 15 : 6) : 0;
              const pixPrice = price
                ? Math.max(0, price * (1 - discountPercent / 100))
                : null;

              return (
                <div className="">
                  <p
                    className={`text-xl text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-2`}
                  >
                    {price ? `R$ ${price.toFixed(2)}` : "Preço não disponível"}
                  </p>

                  {price && (
                    <div className="mt-1">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Pix: R$ {pixPrice!.toFixed(2)} ({discountPercent}% off)
                      </p>
                    </div>
                  )}
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    12x de R${" "}
                    {price ? (price / 12).toFixed(2) : "Preço não disponível"}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CardProduct;
