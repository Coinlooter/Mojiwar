import { InventoryBoard } from "@/components/inventory/InventoryBoard";
import { requireCharacter } from "@/lib/auth/require-character";
import { MAX_STARTER_DECK_SIZE } from "@/lib/game/cards";
import { fetchDeckPageData } from "@/lib/game/deck-page";
import type { DeckActionError } from "@/app/deck/actions";

export const dynamic = "force-dynamic";

const errorCodes = new Set<DeckActionError>(["invalid", "card", "slot"]);

function isDeckActionError(value: string | undefined): value is DeckActionError {
  return value !== undefined && errorCodes.has(value as DeckActionError);
}

export default async function DeckPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user, character } = await requireCharacter();
  const params = await searchParams;
  const initialError = isDeckActionError(params.error) ? params.error : null;
  const { slots, collection } = await fetchDeckPageData(
    supabase,
    user.id,
    character.id,
  );

  return (
    <div className="inventory-page">
      <header className="inventory-top panel battle-card">
        <div>
          <p className="eyebrow">Inventar</p>
          <h1>{MAX_STARTER_DECK_SIZE} Karten entscheiden deinen Build.</h1>
          <p className="muted inventory-top-lead">
            Baue dein Deck mit Drag-and-Drop — drei Karten, unendlich viele
            Kombos.
          </p>
        </div>
      </header>

      <InventoryBoard
        collection={collection}
        initialError={initialError}
        slots={slots}
      />
    </div>
  );
}
