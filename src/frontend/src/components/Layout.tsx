import { useSession } from "@/hooks/useSession";
import { THEMES } from "@/lib/catalog";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { type ReactNode, useState } from "react";

function BrickLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <rect x="4" y="12" width="32" height="22" rx="4" fill="currentColor" />
      <rect x="9" y="6" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="23" y="6" width="8" height="8" rx="2" fill="currentColor" />
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useSession();

  const navItems = [
    { label: "Inicio", to: "/" as const, params: undefined },
    ...THEMES.map((theme) => ({
      label: theme.name,
      to: "/tema/$themeId" as const,
      params: { themeId: theme.id },
    })),
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            to="/"
            data-ocid="nav.link"
            className="flex shrink-0 items-center gap-2 transition-smooth hover:opacity-80"
          >
            <BrickLogo className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
              DayShop
            </span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                params={item.params}
                data-ocid="nav.link"
                className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-smooth hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to={isAuthenticated ? "/cuenta" : "/iniciar-sesion"}
              data-ocid={
                isAuthenticated ? "nav.account_link" : "nav.signin_link"
              }
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-brick transition-smooth hover:-translate-y-0.5 hover:shadow-brick-hover sm:inline-flex"
            >
              {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
            </Link>
            <button
              type="button"
              aria-label="Carrito de compras"
              data-ocid="nav.cart_button"
              className="grid h-11 w-11 place-items-center rounded-full text-foreground transition-smooth hover:bg-secondary"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              data-ocid="nav.menu_toggle"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-full text-foreground transition-smooth hover:bg-secondary lg:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label="Navegación móvil"
            className="border-t border-border bg-card px-4 pb-4 pt-2 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    params={item.params}
                    data-ocid="nav.link"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-semibold text-foreground transition-smooth hover:bg-secondary"
                    activeProps={{ className: "text-primary" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={isAuthenticated ? "/cuenta" : "/iniciar-sesion"}
                  data-ocid={
                    isAuthenticated ? "nav.account_link" : "nav.signin_link"
                  }
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 block rounded-full bg-primary px-4 py-3 text-center text-base font-bold text-primary-foreground"
                >
                  {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-foreground text-background">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <BrickLogo className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-extrabold text-background">
                DayShop
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-background/70">
              La tienda de ladrillos para constructores de todas las edades.
              Colecciones Ninjago, Star Wars, Chima, Scooby-Doo y mucho más.
            </p>
          </div>
          <FooterColumn
            title="Tienda"
            links={[
              { label: "Inicio", to: "/" },
              {
                label: "Ninjago",
                to: "/tema/$themeId",
                params: { themeId: "ninjago" },
              },
              {
                label: "Star Wars",
                to: "/tema/$themeId",
                params: { themeId: "star-wars" },
              },
              {
                label: "Variado",
                to: "/tema/$themeId",
                params: { themeId: "variado" },
              },
            ]}
          />
          <FooterColumn
            title="Ayuda"
            links={[
              { label: "Envío y devoluciones", to: "/" },
              { label: "Contacto", to: "/" },
              { label: "Preguntas frecuentes", to: "/" },
            ]}
          />
          <FooterColumn
            title="Cuenta"
            links={[
              { label: "Iniciar sesión", to: "/iniciar-sesion" },
              { label: "Crear cuenta", to: "/registro" },
              { label: "Mis compras", to: "/cuenta" },
            ]}
          />
        </div>
        <div className="border-t border-background/15">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-background/60 sm:flex-row sm:px-6">
            <p>
              © {new Date().getFullYear()}. Hecho con cariño usando{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noreferrer"
                className="underline transition-smooth hover:text-background"
              >
                caffeine.ai
              </a>
            </p>
            <p>Precios en euros (€). IVA incluido.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; to: string; params?: Record<string, string> }>;
}) {
  return (
    <div>
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-background/90">
        {title}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              params={link.params}
              data-ocid="footer.link"
              className="text-sm text-background/70 transition-smooth hover:text-background"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
