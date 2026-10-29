import type { AuthError } from "@/backend";
import { useRegisterCustomer, useSession, useSignIn } from "@/hooks/useSession";
import {
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  isValidPassword,
} from "@/lib/validation";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

const EMAIL_MESSAGE = "Ingresa un correo electrónico válido";
const PASSWORD_MESSAGE = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;

function authErrorMessage(error: AuthError): string {
  switch (error.__kind__) {
    case "duplicateEmail":
      return "Ese correo ya está registrado. Inicia sesión o usa otro correo.";
    case "invalidEmail":
      return "Ingresa un correo electrónico válido";
    case "weakPassword":
      return PASSWORD_MESSAGE;
    case "accountLocked":
      return "La cuenta está bloqueada temporalmente. Inténtalo más tarde.";
    case "invalidCredentials":
      return "El correo o la contraseña no son correctos.";
    case "notAuthenticated":
      return "No se pudo completar el registro. Inténtalo de nuevo.";
    default:
      return "No se pudo completar el registro. Inténtalo de nuevo.";
  }
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const registerCustomer = useRegisterCustomer();
  const signInMutation = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isPending = registerCustomer.isPending || signInMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    const nextEmailMessage = isValidEmail(trimmedEmail) ? null : EMAIL_MESSAGE;
    const nextPasswordMessage = isValidPassword(password)
      ? null
      : PASSWORD_MESSAGE;
    setEmailMessage(nextEmailMessage);
    setPasswordMessage(nextPasswordMessage);
    if (nextEmailMessage || nextPasswordMessage) return;

    const displayName = trimmedEmail.split("@")[0] ?? trimmedEmail;

    try {
      const result = await registerCustomer.mutateAsync({
        email: trimmedEmail,
        password,
        displayName,
      });
      if (result.__kind__ === "err") {
        setFormError(authErrorMessage(result.err));
        return;
      }

      const sessionResult = await signInMutation.mutateAsync({
        email: trimmedEmail,
        password,
      });
      if (sessionResult.__kind__ === "err") {
        setFormError(
          "Tu cuenta se creó, pero no pudimos iniciar sesión. Prueba a iniciar sesión manualmente.",
        );
        return;
      }

      signIn({
        token: sessionResult.ok.token,
        email: trimmedEmail,
        expiresAt: Number(sessionResult.ok.expiresAt / 1_000_000n),
      });
      await navigate({ to: "/cuenta" });
    } catch {
      setFormError("No se pudo completar el registro. Inténtalo de nuevo.");
    }
  }

  return (
    <div
      data-ocid="register.page"
      className="bg-gradient-hero brick-studs min-h-[calc(100dvh-4rem)]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
        <section className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-accent-foreground">
            Únete a DayShop
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground text-balance sm:text-5xl">
            Crea tu cuenta y empieza a construir
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Guarda tus sets favoritos, sigue tus compras y recibe novedades de
            Ninjago, Star Wars, Chima, Scooby-Doo y nuestra colección variada.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Historial de compras",
                body: "Consulta todos tus pedidos en un solo lugar.",
              },
              {
                title: "Colecciones a tu medida",
                body: "Descubre lanzamientos de tus franquicias favoritas.",
              },
              {
                title: "Compra más rápido",
                body: "Tus datos listos para tu próxima construcción.",
              },
              {
                title: "Ofertas exclusivas",
                body: "Promociones reservadas para la comunidad DayShop.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-border bg-card/80 p-4 shadow-subtle backdrop-blur"
              >
                <h2 className="font-display text-base font-bold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="order-1 lg:order-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-brick sm:p-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Crear cuenta
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Solo necesitas tu correo y una contraseña segura.
            </p>

            <form
              noValidate
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="register-email"
                  className="font-display text-sm font-bold text-foreground"
                >
                  Correo electrónico
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@correo.com"
                  value={email}
                  data-ocid="register.email_input"
                  aria-invalid={emailMessage !== null}
                  aria-describedby={
                    emailMessage ? "register-email-error" : undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailMessage) setEmailMessage(null);
                  }}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none transition-smooth placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                {emailMessage && (
                  <p
                    id="register-email-error"
                    data-ocid="register.email_error"
                    className="flex items-center gap-1.5 text-sm font-semibold text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {emailMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="register-password"
                  className="font-display text-sm font-bold text-foreground"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                    value={password}
                    data-ocid="register.password_input"
                    aria-invalid={passwordMessage !== null}
                    aria-describedby={
                      passwordMessage ? "register-password-error" : undefined
                    }
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordMessage) setPasswordMessage(null);
                    }}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-base text-foreground outline-none transition-smooth placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                  <button
                    type="button"
                    data-ocid="register.password_toggle"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordMessage && (
                  <p
                    id="register-password-error"
                    data-ocid="register.password_error"
                    className="flex items-center gap-1.5 text-sm font-semibold text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {passwordMessage}
                  </p>
                )}
              </div>

              {formError && (
                <div
                  role="alert"
                  data-ocid="register.error_state"
                  className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                data-ocid="register.submit_button"
                disabled={isPending}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-base font-extrabold text-primary-foreground shadow-brick transition-smooth hover:-translate-y-0.5 hover:shadow-brick-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isPending && (
                  <Loader2 className="h-5 w-5 motion-safe:animate-spin" />
                )}
                {isPending ? "Creando tu cuenta…" : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/iniciar-sesion"
                data-ocid="register.signin_link"
                className="font-bold text-primary underline-offset-4 transition-smooth hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
