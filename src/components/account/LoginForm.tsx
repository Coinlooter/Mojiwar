import { SubmitButton } from "@/components/ui/SubmitButton";
import { RECOVERY_ANIMALS, RECOVERY_COLORS } from "@/lib/auth/recovery-words";
import { loginWithRecoveryCode } from "@/app/login/actions";

export function LoginForm() {
  return (
    <form action={loginWithRecoveryCode} className="panel battle-card form-card">
      <label className="field-label" htmlFor="colorSlug">
        Farbe
      </label>
      <select className="text-input" defaultValue="" id="colorSlug" name="colorSlug">
        <option disabled value="">
          Farbe wählen
        </option>
        {RECOVERY_COLORS.map((color) => (
          <option key={color.slug} value={color.slug}>
            {color.label}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="animalSlug">
        Tier
      </label>
      <select className="text-input" defaultValue="" id="animalSlug" name="animalSlug">
        <option disabled value="">
          Tier wählen
        </option>
        {RECOVERY_ANIMALS.map((animal) => (
          <option key={animal.slug} value={animal.slug}>
            {animal.label}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="numberSuffix">
        Zwei Zahlen
      </label>
      <input
        className="text-input"
        id="numberSuffix"
        inputMode="numeric"
        maxLength={2}
        minLength={2}
        name="numberSuffix"
        pattern="[0-9]{2}"
        placeholder="z. B. 65"
        title="Genau zwei Ziffern"
      />

      <details className="account-details">
        <summary>Code als Text eingeben</summary>
        <label className="field-label" htmlFor="combined">
          Kompletter Code
        </label>
        <input
          autoComplete="off"
          className="text-input"
          id="combined"
          name="combined"
          placeholder="z. B. blauerelefant65"
          spellCheck={false}
        />
      </details>

      <SubmitButton pendingLabel="Login..." variant="primary">
        Login
      </SubmitButton>
    </form>
  );
}
