import { ProductCard } from "@/components/ProductCard";
import { getTheme, productsByTheme } from "@/lib/catalog";
import type { ThemeId } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function ThemePage() {
  const { themeId } = useParams({ from: "/tema/$themeId" });
  const theme = getTheme(themeId as ThemeId);
  const products = productsByTheme(theme.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Link
        to="/"
        data-ocid="theme.back_link"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-smooth hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <header
        data-ocid="theme.header"
        className={`mt-6 overflow-hidden rounded-3xl p-8 shadow-brick sm:p-12 ${theme.cardClass} ${theme.textClass}`}
      >
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {theme.name}
        </h1>
        <p className="mt-3 max-w-lg text-lg opacity-85">{theme.tagline}</p>
      </header>

      <section data-ocid="theme.products_section" className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-foreground">
          {products.length} {products.length === 1 ? "set" : "sets"} disponibles
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
