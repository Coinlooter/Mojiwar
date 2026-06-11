import { SubmitButton } from "@/components/ui/SubmitButton";
import { loginWithCredential } from "@/app/login/actions";

export function LoginForm() {
  return (
    <form action={loginWithCredential} className="panel battle-card login-form">
      <label className="field-label" htmlFor="credential">
        Login-Code oder E-Mail
      </label>
      <input
        autoComplete="username"
        autoFocus
        className="text-input"
        id="credential"
        name="credential"
        placeholder="z. B. blauerelefant65 oder deine@email.de"
        required
        spellCheck={false}
        type="text"
      />
      <p className="login-form-hint muted">
        Code aus Farbe, Tier und zwei Zahlen — oder die E-Mail, mit der du dein
        Konto gesichert hast.
      </p>
      <SubmitButton pendingLabel="Login..." variant="primary">
        Login
      </SubmitButton>
    </form>
  );
}
