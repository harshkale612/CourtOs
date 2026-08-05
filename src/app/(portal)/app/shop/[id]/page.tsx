"use client";

import { useParams } from "next/navigation";
import { ProductDetail } from "@/features/shop/product-detail";

export default function ShopProductPage() {
  const params = useParams<{ id: string }>();
  return <ProductDetail productId={params.id} />;
}
