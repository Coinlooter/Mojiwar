import { equipDeckSlot, unequipDeckSlot } from "@/app/deck/actions";
import { requireCharacter } from "@/lib/auth/require-character";
import { MAX_STARTER_DECK_SIZE } from "@/lib/game/cards";
import { mapCardRow } from "@/lib/game/loadout";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "Diese Karte konnte nicht ausgeruestet werden.",
  card: "Diese Karte gehoert dir nicht.",
  slot: "Das Deck konnte gerade nicht aktualisiert werden.",
};

export default async function DeckPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user, character } = await requireCharacter();
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  const [{ data: ownedCards }, { data: deckSlots }] = await Promise.all([
    supabase
      .from("player_cards")
      .select("id, card_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("deck_slots")
      .select("slot_index, player_card_id")
      .eq("character_id", character.id)
      .order("slot_index", { ascending: true }),
  ]);

  const cardIds = [...new Set((ownedCards ?? []).map((ownedCard) => ownedCard.card_id))];
  const { data: cardRows } = cardIds.length
    ? await supabase.from("cards").select("*").in("id", cardIds)
    : { data: [] };

  const cardsById = new Map((cardRows ?? []).map((card) => [card.id, mapCardRow(card)]));
  const activeBySlot = new Map(
    (deckSlots ?? []).map((slot) => [slot.slot_index, slot.player_card_id]),
  );
  const activeCardIds = new Set(activeBySlot.values());

  return (
    <>
      <section>
        <p className="eyebrow">Dein Deck</p>
        <h1>{MAX_STARTER_DECK_SIZE} Karten entscheiden deinen Build.</h1>
        <p className="lead">
          Waehle bis zu drei Karten fuer dein aktives Deck. Staerkere Kombos
          machen dein Emoji im Kampf gefaehrlicher.
        </p>
      </section>

      {errorMessage ? (
        <p className="muted" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="section">
        <p className="eyebrow">Aktive Slots</p>
        <div className="feature-grid">
          {Array.from({ length: MAX_STARTER_DECK_SIZE }, (_, slotIndex) => {
            const activeCardId = activeBySlot.get(slotIndex);

            return (
              <article className="feature-card" key={slotIndex}>
                <p className="eyebrow">Slot {slotIndex + 1}</p>
                {activeCardId ? (
                  <>
                    <p className="muted">Karte ist aktiv.</p>
                    <form action={unequipDeckSlot}>
                      <input name="slotIndex" type="hidden" value={slotIndex} />
                      <button className="button" type="submit">
                        Ausruesten entfernen
                      </button>
                    </form>
                  </>
                ) : (
                  <p className="muted">Noch leer.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="section feature-grid" aria-label="Kartensammlung">
        {(ownedCards ?? []).length === 0 ? (
          <article className="feature-card">
            <p className="muted">
              Du hast noch keine Karten. Gewinne Kaempfe, um neue Karten zu
              sammeln.
            </p>
          </article>
        ) : null}

        {(ownedCards ?? []).map((ownedCard) => {
          const card = cardsById.get(ownedCard.card_id);

          if (!card) {
            return null;
          }

          const active = activeCardIds.has(ownedCard.id);

          return (
            <article className="feature-card" key={ownedCard.id}>
              <div className="emoji">{card.emoji}</div>
              <p className="eyebrow">{card.rarity}</p>
              <h3>{card.name}</h3>
              <p className="muted">{card.description}</p>
              <p style={{ color: active ? "var(--success)" : "var(--muted)" }}>
                {active ? "Aktiv im Deck" : "In Sammlung"}
              </p>
              {!active ? (
                <div className="actions">
                  {Array.from({ length: MAX_STARTER_DECK_SIZE }, (_, slotIndex) => (
                    <form action={equipDeckSlot} key={`${ownedCard.id}-${slotIndex}`}>
                      <input
                        name="playerCardId"
                        type="hidden"
                        value={ownedCard.id}
                      />
                      <input name="slotIndex" type="hidden" value={slotIndex} />
                      <button className="button" type="submit">
                        Slot {slotIndex + 1}
                      </button>
                    </form>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
