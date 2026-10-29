import { ProductCard } from "@/components/ProductCard";
import {
  formatPrice,
  getProduct,
  getTheme,
  productsByTheme,
} from "@/lib/catalog";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, ShieldCheck, Truck, Users } from "lucide-react";

export function ProductDetailPage() {
  const { productId } = useParams({ from: "/producto/$productId" });
  const product = getProduct(productId);

  if (!product) {
    return (
      <div
        data-ocid="product.not_found_state"
        className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center"
      >
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-secondary text-4xl">
          🧱
        </span>
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          Set no encontrado
        </h1>
        <p className="max-w-md text-muted-foreground">
          El set que buscas no existe o ya no está disponible. Explora nuestras
          colecciones para encontrar tu próximo desafío de construcción.
        </p>
        <Link
          to="/"
          data-ocid="product.back_link"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-brick transition-smooth hover:-translate-y-0.5 hover:shadow-brick-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  const theme = getTheme(product.theme);
  const related = productsByTheme(theme.id).filter(
    (item) => item.id !== product.id,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        to="/tema/$themeId"
        params={{ themeId: theme.id }}
        data-ocid="product.back_link"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-smooth hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a {theme.name}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-brick">
          <img
            src={product.image}
            alt={`Set LEGO ${product.name}`}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <Link
            to="/tema/$themeId"
            params={{ themeId: theme.id }}
            data-ocid="product.theme_link"
            className={`inline-flex w-fit rounded-full px-4 py-1.5 text-sm font-bold transition-smooth hover:-translate-y-0.5 ${theme.cardClass} ${theme.textClass}`}
          >
            {theme.name}
          </Link>

          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 font-display text-3xl font-extrabold text-primary sm:text-4xl">
            {formatPrice(product.priceCents)}
          </p>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Package className="h-4 w-4 text-primary" />
                Piezas
              </dt>
              <dd className="mt-1 font-display text-xl font-extrabold text-foreground">
                {product.pieces}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                Edad recomendada
              </dt>
              <dd className="mt-1 font-display text-xl font-extrabold text-foreground">
                {product.ageRange}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/registro"
              data-ocid="product.register_link"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-brick transition-smooth hover:-translate-y-0.5 hover:shadow-brick-hover"
            >
              Crear cuenta
            </Link>
            <Link
              to="/iniciar-sesion"
              data-ocid="product.signin_link"
              className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-7 py-3.5 font-bold text-foreground transition-smooth hover:bg-foreground hover:text-background"
            >
              Iniciar sesión
            </Link>
          </div>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Envío en 24-48 horas
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Devolución gratuita durante 30 días
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section data-ocid="product.related_section" className="mt-16">
          <h2 className="font-display text-2xl font-extrabold text-foreground">
            Más sets de {theme.name}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
