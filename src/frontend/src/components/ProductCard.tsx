import { formatPrice, getTheme } from "@/lib/catalog";
import type { Product } from "@/types";
import { Link } from "@tanstack/react-router";

export function ProductCard({ product }: { product: Product }) {
  const theme = getTheme(product.theme);
  return (
    <article
      data-ocid="product.card"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-brick transition-smooth hover:-translate-y-1 hover:shadow-brick-hover"
    >
      <Link
        to="/producto/$productId"
        params={{ productId: product.id }}
        data-ocid="product.link"
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={`Set LEGO ${product.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${theme.cardClass} ${theme.textClass}`}
          >
            {theme.name}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-lg font-bold leading-tight text-foreground">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="font-display text-xl font-extrabold text-primary">
            {formatPrice(product.priceCents)}
          </span>
          <Link
            to="/producto/$productId"
            params={{ productId: product.id }}
            data-ocid="product.view_button"
            className="rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-bold text-foreground transition-smooth hover:bg-foreground hover:text-background"
          >
            Ver set
          </Link>
        </div>
      </div>
    </article>
  );
}
