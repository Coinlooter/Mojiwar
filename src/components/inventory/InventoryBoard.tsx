"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  equipDeckSlotById,
  unequipDeckSlotByIndex,
  type DeckActionError,
} from "@/app/deck/actions";
import { GameCard } from "@/components/cards/GameCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type {
  InventoryCardData,
  InventorySlotData,
} from "@/lib/inventory/types";

const DRAG_CARD_MIME = "application/x-mojiwar-card";
const DRAG_SLOT_MIME = "application/x-mojiwar-slot";

const errorMessages: Record<DeckActionError, string> = {
  invalid: "Diese Karte konnte nicht platziert werden.",
  card: "Diese Karte gehoert dir nicht.",
  slot: "Das Inventar konnte gerade nicht aktualisiert werden.",
};

type DragSource =
  | { kind: "inventory"; playerCardId: string }
  | { kind: "slot"; playerCardId: string; slotIndex: number };

export function InventoryBoard({
  slots,
  collection,
  initialError,
}: {
  slots: InventorySlotData[];
  collection: InventoryCardData[];
  initialError: DeckActionError | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [inventoryHover, setInventoryHover] = useState(false);
  const [actionError, setActionError] = useState<string | null>(
    initialError ? errorMessages[initialError] : null,
  );

  function runDeckAction(action: () => Promise<{ ok: true } | { ok: false; error: DeckActionError }>) {
    setActionError(null);

    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        setActionError(errorMessages[result.error]);
        return;
      }

      router.refresh();
    });
  }

  function handleDragStartInventory(card: InventoryCardData, event: React.DragEvent) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_CARD_MIME, card.playerCardId);
    event.dataTransfer.setData("text/plain", card.playerCardId);
    setDragSource({ kind: "inventory", playerCardId: card.playerCardId });
  }

  function handleDragStartSlot(slot: InventorySlotData, event: React.DragEvent) {
    if (!slot.card) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_CARD_MIME, slot.card.playerCardId);
    event.dataTransfer.setData(DRAG_SLOT_MIME, String(slot.slotIndex));
    event.dataTransfer.setData("text/plain", slot.card.playerCardId);
    setDragSource({
      kind: "slot",
      playerCardId: slot.card.playerCardId,
      slotIndex: slot.slotIndex,
    });
  }

  function readDraggedCardId(event: React.DragEvent) {
    return (
      event.dataTransfer.getData(DRAG_CARD_MIME) ||
      event.dataTransfer.getData("text/plain")
    );
  }

  function handleDropOnSlot(slotIndex: number, event: React.DragEvent) {
    event.preventDefault();
    setHoverSlot(null);

    const playerCardId = readDraggedCardId(event);

    if (!playerCardId) {
      return;
    }

    runDeckAction(() => equipDeckSlotById(playerCardId, slotIndex));
  }

  function handleDropOnInventory(event: React.DragEvent) {
    event.preventDefault();
    setInventoryHover(false);

    const sourceSlotRaw = event.dataTransfer.getData(DRAG_SLOT_MIME);

    if (!sourceSlotRaw) {
      return;
    }

    const slotIndex = Number(sourceSlotRaw);

    if (Number.isNaN(slotIndex)) {
      return;
    }

    runDeckAction(() => unequipDeckSlotByIndex(slotIndex));
  }

  function clearDragState() {
    setDragSource(null);
    setHoverSlot(null);
    setInventoryHover(false);
  }

  return (
    <div className={`inventory-board${isPending ? " inventory-board-pending" : ""}`}>
      {actionError ? (
        <p className="muted inventory-board-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {isPending ? (
        <p aria-live="polite" className="inventory-board-status">
          <LoadingSpinner />
          Inventar wird aktualisiert...
        </p>
      ) : null}

      <section className="section">
        <p className="eyebrow">Aktive Slots</p>
        <p className="muted inventory-board-hint">
          Ziehe Karten aus dem Inventar in einen Slot. Ziehe aus einem Slot
          zurueck ins Inventar, um sie zu entfernen.
        </p>
        <div className="deck-slot-grid">
          {slots.map((slot) => {
            const isHover = hoverSlot === slot.slotIndex;
            const isDraggingFromHere =
              dragSource?.kind === "slot" && dragSource.slotIndex === slot.slotIndex;

            return (
              <div className="deck-slot-card" key={slot.slotIndex}>
                <p className="deck-slot-label">Slot {slot.slotIndex + 1}</p>
                <div
                  className={`deck-slot-drop${isHover ? " deck-slot-drop-hover" : ""}${slot.card ? " deck-slot-drop-filled" : ""}`}
                  onDragEnd={clearDragState}
                  onDragLeave={() => {
                    setHoverSlot((current) =>
                      current === slot.slotIndex ? null : current,
                    );
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setHoverSlot(slot.slotIndex);
                  }}
                  onDrop={(event) => {
                    handleDropOnSlot(slot.slotIndex, event);
                    clearDragState();
                  }}
                >
                  {slot.card ? (
                    <div
                      className={`inventory-draggable${isDraggingFromHere ? " is-dragging" : ""}`}
                      draggable={!isPending}
                      onDragEnd={clearDragState}
                      onDragStart={(event) => {
                        handleDragStartSlot(slot, event);
                      }}
                    >
                      <GameCard
                        active
                        description={slot.card.description}
                        emoji={slot.card.emoji}
                        name={slot.card.name}
                        rarity={slot.card.rarity}
                      />
                    </div>
                  ) : (
                    <div className="deck-slot-empty">
                      {isHover ? "Hier ablegen" : "Slot leer"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Inventar</p>
        <div
          className={`inventory-collection${inventoryHover ? " inventory-collection-hover" : ""}${dragSource?.kind === "slot" ? " inventory-collection-unequip" : ""}`}
          onDragEnd={clearDragState}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) {
              return;
            }

            setInventoryHover(false);
          }}
          onDragOver={(event) => {
            if (dragSource?.kind !== "slot") {
              return;
            }

            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setInventoryHover(true);
          }}
          onDrop={(event) => {
            handleDropOnInventory(event);
            clearDragState();
          }}
        >
          {collection.length === 0 ? (
            <article className="feature-card inventory-collection-empty">
              <p className="muted">
                {dragSource?.kind === "slot"
                  ? "Hier ablegen, um die Karte aus dem Deck zu nehmen."
                  : "Noch keine Karten im Inventar. Gewinne Kaempfe, um neue Karten zu sammeln."}
              </p>
            </article>
          ) : (
            <div className="deck-card-grid" aria-label="Inventar">
              {collection.map((card) => {
                const isDragging =
                  dragSource?.kind === "inventory" &&
                  dragSource.playerCardId === card.playerCardId;

                return (
                  <div className="deck-card-item" key={card.playerCardId}>
                    <div
                      className={`inventory-draggable${isDragging ? " is-dragging" : ""}`}
                      draggable={!isPending}
                      onDragEnd={clearDragState}
                      onDragStart={(event) => {
                        handleDragStartInventory(card, event);
                      }}
                    >
                      <GameCard
                        description={card.description}
                        emoji={card.emoji}
                        name={card.name}
                        rarity={card.rarity}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
