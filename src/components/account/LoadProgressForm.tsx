import { SubmitButton } from "@/components/ui/SubmitButton";
import { RECOVERY_ANIMALS, RECOVERY_COLORS } from "@/lib/auth/recovery-words";
import { loadProgressWithRecoveryCode } from "@/app/account/load/actions";

export function LoadProgressForm() {
  return (
    <form action={loadProgressWithRecoveryCode} className="panel battle-card form-card">
      <p className="eyebrow">Speicher-Code</p>
      <p className="muted account-form-copy">
        Waehle Farbe, Tier und die zwei Zahlen von deinem Zettel.
      </p>

      <label className="field-label" htmlFor="colorSlug">
        Farbe
      </label>
      <select className="text-input" defaultValue="" id="colorSlug" name="colorSlug">
        <option disabled value="">
          Farbe waehlen
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
          Tier waehlen
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
        <summary>Oder Code als Text eingeben</summary>
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

      <SubmitButton pendingLabel="Fortschritt wird geladen..." variant="primary">
        Fortschritt laden
      </SubmitButton>
    </form>
  );
}
