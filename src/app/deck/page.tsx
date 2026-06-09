import { equipDeckSlot, unequipDeckSlot } from "@/app/deck/actions";
import { GameCard } from "@/components/cards/GameCard";
import { SubmitButton } from "@/components/ui/SubmitButton";
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
  const ownedCardsById = new Map((ownedCards ?? []).map((ownedCard) => [ownedCard.id, ownedCard]));
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
        <div className="deck-slot-grid">
          {Array.from({ length: MAX_STARTER_DECK_SIZE }, (_, slotIndex) => {
            const activeCardId = activeBySlot.get(slotIndex);
            const ownedCard = activeCardId ? ownedCardsById.get(activeCardId) : null;
            const card = ownedCard ? cardsById.get(ownedCard.card_id) : null;

            return (
              <div className="deck-slot-card" key={slotIndex}>
                <p className="deck-slot-label">Slot {slotIndex + 1}</p>
                {card ? (
                  <>
                    <GameCard
                      active
                      description={card.description}
                      emoji={card.emoji}
                      name={card.name}
                      rarity={card.rarity}
                    />
                    <form action={unequipDeckSlot}>
                      <input name="slotIndex" type="hidden" value={slotIndex} />
                      <SubmitButton pendingLabel="Wird entfernt...">
                        Ausruesten entfernen
                      </SubmitButton>
                    </form>
                  </>
                ) : (
                  <div className="deck-slot-empty">Noch leer</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Kartensammlung</p>
        {(ownedCards ?? []).length === 0 ? (
          <article className="feature-card">
            <p className="muted">
              Du hast noch keine Karten. Gewinne Kaempfe, um neue Karten zu
              sammeln.
            </p>
          </article>
        ) : (
          <div className="deck-card-grid" aria-label="Kartensammlung">
            {(ownedCards ?? []).map((ownedCard) => {
              const card = cardsById.get(ownedCard.card_id);

              if (!card) {
                return null;
              }

              const active = activeCardIds.has(ownedCard.id);

              return (
                <div className="deck-card-item" key={ownedCard.id}>
                  <GameCard
                    active={active}
                    description={card.description}
                    emoji={card.emoji}
                    name={card.name}
                    rarity={card.rarity}
                  />
                  <div className="deck-card-meta">
                    <p style={{ color: active ? "var(--success)" : "var(--muted)" }}>
                      {active ? "Aktiv im Deck" : "In Sammlung"}
                    </p>
                    {!active ? (
                      <div className="actions" style={{ justifyContent: "center" }}>
                        {Array.from({ length: MAX_STARTER_DECK_SIZE }, (_, slotIndex) => (
                          <form action={equipDeckSlot} key={`${ownedCard.id}-${slotIndex}`}>
                            <input
                              name="playerCardId"
                              type="hidden"
                              value={ownedCard.id}
                            />
                            <input name="slotIndex" type="hidden" value={slotIndex} />
                            <SubmitButton pendingLabel="Wird ausgeruestet...">
                              Slot {slotIndex + 1}
                            </SubmitButton>
                          </form>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
