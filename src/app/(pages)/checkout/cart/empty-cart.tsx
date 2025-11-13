import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export function EmptyCart() {
  return (
    <div className="text-center py-8">
      <ShoppingCart className="mx-auto size-16 text-gray-400 mb-4" />
      <p className="text-lg font-semibold">Seu carrinho está vazio</p>
      <Link href="/products">
        <Button className="mt-4">Continuar comprando</Button>
      </Link>
    </div>
  )
}
