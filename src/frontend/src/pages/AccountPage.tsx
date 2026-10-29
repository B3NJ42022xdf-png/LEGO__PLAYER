import type { AuthError, Purchase } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMyProfile,
  useMyPurchases,
  useSession,
  useSignOut,
} from "@/hooks/useSession";
import { THEMES, formatPrice } from "@/lib/catalog";
import type { LegoTheme } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  LogOut,
  PackageOpen,
  Receipt,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

/** Convert a Motoko nanosecond timestamp into a readable Spanish date. */
function formatPurchaseDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Resolve a backend theme id to its catalog entry, with a safe fallback. */
function resolveTheme(themeId: string): LegoTheme {
  return THEMES.find((theme) => theme.id === themeId) ?? THEMES[0];
}

function authErrorMessage(error: AuthError): string {
  switch (error.__kind__) {
    case "notAuthenticated":
      return "Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.";
    case "accountLocked":
      return "Tu cuenta está bloqueada temporalmente. Inténtalo más tarde.";
    case "invalidCredentials":
      return "No hemos podido validar tus credenciales.";
    default:
      return "No hemos podido cargar tus datos. Inténtalo de nuevo.";
  }
}

export function AccountPage() {
  const { session, isAuthenticated, signOut } = useSession();
  const navigate = useNavigate();
  const signOutMutation = useSignOut();

  const token = session?.token;
  const profileQuery = useMyProfile(token);
  const purchasesQuery = useMyPurchases(token);

  const handleSignOut = () => {
    const currentToken = session?.token;
    signOut();
    if (currentToken) {
      signOutMutation.mutate(currentToken);
    }
    void navigate({ to: "/" });
  };

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="account.page"
        className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6"
      >
        <div
          data-ocid="account.signed_out_state"
          className="rounded-2xl border border-border bg-card p-8 text-center shadow-subtle sm:p-12"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-foreground">
            Inicia sesión para ver tu cuenta
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Esta sección es privada. Accede con tu correo y contraseña para
            consultar tus datos y tu historial de compras.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              data-ocid="account.signin_button"
              className="h-12 rounded-full bg-primary px-7 text-base font-bold text-primary-foreground shadow-brick transition-smooth hover:-translate-y-0.5 hover:shadow-brick-hover"
            >
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              data-ocid="account.register_link"
              className="h-12 rounded-full border-border px-7 text-base font-bold transition-smooth"
            >
              <Link to="/registro">Crear una cuenta</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const profileError =
    profile && profile.__kind__ === "err" ? profile.err : null;
  const customer = profile && profile.__kind__ === "ok" ? profile.ok : null;

  const purchasesResult = purchasesQuery.data;
  const purchasesError =
    purchasesResult && purchasesResult.__kind__ === "err"
      ? purchasesResult.err
      : null;
  const purchases: Purchase[] =
    purchasesResult && purchasesResult.__kind__ === "ok"
      ? purchasesResult.ok
      : [];

  const isLoading = profileQuery.isLoading || purchasesQuery.isLoading;
  const error = profileError ?? purchasesError;

  return (
    <div
      data-ocid="account.page"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            Mi cuenta
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Mis compras
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Consulta los datos de tu cuenta y el historial de pedidos que has
            realizado en DayShop.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          data-ocid="account.signout_button"
          onClick={handleSignOut}
          disabled={signOutMutation.isPending}
          className="h-11 shrink-0 rounded-full border-border px-6 font-bold transition-smooth"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {signOutMutation.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
        </Button>
      </header>

      {error ? (
        <div
          data-ocid="account.error_state"
          className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive"
        >
          {authErrorMessage(error)}
        </div>
      ) : null}

      <section
        data-ocid="account.profile_card"
        className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-subtle"
      >
        <div className="flex flex-col gap-4 border-b border-border bg-secondary/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground">
              {(customer?.displayName ?? session?.email ?? "?")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-foreground">
                {customer?.displayName ?? "Cliente DayShop"}
              </p>
              <p
                data-ocid="account.email"
                className="truncate text-sm text-muted-foreground"
              >
                {customer?.email ?? session?.email}
              </p>
            </div>
          </div>
          {customer ? (
            <Badge
              variant="secondary"
              className="w-fit rounded-full bg-accent px-3 py-1 font-bold text-accent-foreground"
            >
              Miembro desde {formatPurchaseDate(customer.createdAt)}
            </Badge>
          ) : null}
        </div>
        <dl className="grid gap-px bg-border sm:grid-cols-2">
          <div className="bg-card p-6">
            <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Compras realizadas
            </dt>
            <dd className="mt-2 font-display text-3xl font-extrabold text-foreground">
              {isLoading ? "—" : purchases.length}
            </dd>
          </div>
          <div className="bg-card p-6">
            <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Receipt className="h-4 w-4 text-primary" />
              Total gastado
            </dt>
            <dd className="mt-2 font-display text-3xl font-extrabold text-foreground">
              {isLoading
                ? "—"
                : formatPrice(
                    purchases.reduce(
                      (sum, purchase) => sum + Number(purchase.totalCents),
                      0,
                    ),
                  )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          Historial de compras
        </h2>

        {isLoading ? (
          <ul
            data-ocid="account.loading_state"
            className="mt-4 flex flex-col gap-3"
          >
            {Array.from({ length: 3 }, (_, i) => `purchase-skeleton-${i}`).map(
              (id) => (
                <li
                  key={id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                </li>
              ),
            )}
          </ul>
        ) : purchases.length === 0 ? (
          <div
            data-ocid="account.empty_state"
            className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">
              <PackageOpen className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-foreground">
              Todavía no tienes compras
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Cuando realices tu primer pedido aparecerá aquí, con su fecha y su
              importe.
            </p>
            <Button
              asChild
              data-ocid="account.browse_button"
              className="mt-6 h-11 rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-brick transition-smooth hover:-translate-y-0.5 hover:shadow-brick-hover"
            >
              <Link to="/">Explorar la tienda</Link>
            </Button>
          </div>
        ) : (
          <ul
            data-ocid="account.purchases_list"
            className="mt-4 flex flex-col gap-3"
          >
            {purchases.map((purchase, index) => {
              const theme = resolveTheme(purchase.theme);
              return (
                <li
                  key={String(purchase.id)}
                  data-ocid={`account.purchase_item.${index + 1}`}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-brick sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold ${theme.cardClass} ${theme.textClass}`}
                      aria-hidden="true"
                    >
                      {theme.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-bold text-foreground">
                        {purchase.productName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatPurchaseDate(purchase.purchasedAt)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{theme.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {Number(purchase.quantity)}{" "}
                          {Number(purchase.quantity) === 1
                            ? "unidad"
                            : "unidades"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="font-display text-lg font-extrabold text-foreground">
                      {formatPrice(Number(purchase.totalCents))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pedido #{String(purchase.id)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
