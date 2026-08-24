import { Suspense } from "react";
import ShopFilters from "@/components/ShopFilters";

export default function ShopFiltersWrapper(props: React.ComponentProps<typeof ShopFilters>) {
  return (
    <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-zinc-800" />}>
      <ShopFilters {...props} />
    </Suspense>
  );
}
