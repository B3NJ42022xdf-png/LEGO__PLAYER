import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, THEMES } from "@/lib/catalog";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Blocks, Sparkles, Truck } from "lucide-react";

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CollectionsSection />
      <FeaturedSection />
      <PerksSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      data-ocid="home.hero_section"
      className="bg-gradient-hero brick-studs"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="motion-safe:animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            Nuevas colecciones 2026
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Construye tu próxima aventura
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Sets de Ninjago, Star Wars, Chima, Scooby-Doo y mucho más. Ladrillo
            a ladrillo, la diversión nunca termina.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/tema/$themeId"
              params={{ themeId: "ninjago" }}
              data-ocid="home.explore_button"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-brick transition-smooth hover:-translate-y-0.5 hover:shadow-brick-hover"
            >
              Explorar sets
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/registro"
              data-ocid="home.register_button"
              className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-7 py-3.5 font-bold text-foreground transition-smooth hover:bg-foreground hover:text-background"
            >
              Crear cuenta
            </Link>
          </div>
        </div>

        <div className="motion-safe:animate-pop-in overflow-hidden rounded-3xl shadow-elevated">
          <img
            src="/assets/generated/hero-mosaic.dim_1024x1024.jpg"
            alt="Mosaico de sets LEGO: camión de bomberos, caza estelar, ninjas y un dragón"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function CollectionsSection() {
  return (
    <section
      data-ocid="home.collections_section"
      className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Colecciones
          </h2>
          <p className="mt-2 text-muted-foreground">
            Elige tu mundo favorito y empieza a construir.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {THEMES.map((theme) => (
          <Link
            key={theme.id}
            to="/tema/$themeId"
            params={{ themeId: theme.id }}
            data-ocid="home.collection_card"
            className={`group flex flex-col justify-between rounded-2xl p-5 shadow-brick transition-smooth hover:-translate-y-1 hover:shadow-brick-hover ${theme.cardClass} ${theme.textClass}`}
          >
            <Blocks className="h-7 w-7 opacity-80" />
            <div className="mt-8">
              <h3 className="font-display text-xl font-extrabold">
                {theme.name}
              </h3>
              <p className="mt-1 text-xs font-medium opacity-80">
                {theme.tagline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedSection() {
  return (
    <section data-ocid="home.featured_section" className="bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Sets destacados
            </h2>
            <p className="mt-2 text-muted-foreground">
              Los favoritos de nuestra comunidad de constructores.
            </p>
          </div>
          <Link
            to="/tema/$themeId"
            params={{ themeId: "variado" }}
            data-ocid="home.view_all_link"
            className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition-smooth hover:gap-2 sm:inline-flex"
          >
            Ver todo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PerksSection() {
  const perks = [
    {
      icon: Truck,
      title: "Envío rápido",
      text: "Recibe tus sets en 24-48 horas en toda la península.",
    },
    {
      icon: Blocks,
      title: "Piezas garantizadas",
      text: "Todos los sets incluyen el recuento completo de piezas.",
    },
    {
      icon: Sparkles,
      title: "Ediciones exclusivas",
      text: "Descubre lanzamientos y sets de coleccionista.",
    },
  ];
  return (
    <section
      data-ocid="home.perks_section"
      className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {perks.map((perk) => (
          <div
            key={perk.title}
            className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-subtle"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <perk.icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {perk.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{perk.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
