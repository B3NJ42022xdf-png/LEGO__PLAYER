import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession, useSignIn } from "@/hooks/useSession";
import { emailError, passwordError } from "@/lib/validation";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";
import { type FormEvent, useState } from "react";

const GENERIC_ERROR = "Correo o contraseña incorrectos";

function formatLockUntil(until: bigint): string {
  const date = new Date(Number(until / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const signInMutation = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailMessage = emailTouched ? emailError(email) : null;
  const passwordMessage = passwordTouched ? passwordError(password) : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setFormError(null);

    const trimmedEmail = email.trim();
    if (trimmedEmail === "" || password === "") return;
    if (emailError(trimmedEmail) || passwordError(password)) return;

    signInMutation.mutate(
      { email: trimmedEmail, password },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            signIn({
              token: result.ok.token,
              email: trimmedEmail,
              expiresAt: Number(result.ok.expiresAt / 1_000_000n),
            });
            void navigate({ to: "/cuenta" });
            return;
          }
          if (result.err.__kind__ === "accountLocked") {
            const until = formatLockUntil(result.err.accountLocked.until);
            setFormError(
              until
                ? `Tu cuenta está bloqueada temporalmente por 15 minutos. Inténtalo de nuevo a partir de las ${until}.`
                : "Tu cuenta está bloqueada temporalmente por 15 minutos. Inténtalo de nuevo más tarde.",
            );
            return;
          }
          setFormError(GENERIC_ERROR);
        },
        onError: () => {
          setFormError(GENERIC_ERROR);
        },
      },
    );
  };

  return (
    <div
      data-ocid="login.page"
      className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Accede a tu cuenta DayShop
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Consulta tus compras y continúa construyendo tus sets favoritos.
        </p>

        <form
          data-ocid="login.form"
          className="mt-6 space-y-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">Correo electrónico</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="login-email"
                data-ocid="login.email_input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                className="pl-9"
                value={email}
                required
                aria-invalid={emailMessage ? true : undefined}
                aria-describedby={
                  emailMessage ? "login-email-error" : undefined
                }
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmailTouched(true)}
              />
            </div>
            {emailMessage ? (
              <p
                id="login-email-error"
                data-ocid="login.email_error"
                className="text-sm font-medium text-destructive"
              >
                {emailMessage}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Contraseña</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="login-password"
                data-ocid="login.password_input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                className="pl-9 pr-11"
                value={password}
                required
                aria-invalid={passwordMessage ? true : undefined}
                aria-describedby={
                  passwordMessage ? "login-password-error" : undefined
                }
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setPasswordTouched(true)}
              />
              <button
                type="button"
                data-ocid="login.toggle_password"
                className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordMessage ? (
              <p
                id="login-password-error"
                data-ocid="login.password_error"
                className="text-sm font-medium text-destructive"
              >
                {passwordMessage}
              </p>
            ) : null}
          </div>

          {formError ? (
            <div
              data-ocid="login.error_state"
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
            >
              <ShieldAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            data-ocid="login.submit_button"
            className="w-full rounded-full"
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/registro"
            data-ocid="login.register_link"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
