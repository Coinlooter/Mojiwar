"use client";

import { useRef, useState, useTransition } from "react";

import {
  equipDeckSlotById,
  unequipDeckSlotByIndex,
  type DeckActionError,
} from "@/app/deck/actions";
import { GameCard } from "@/components/cards/GameCard";
import { DECK_ERROR_MESSAGES } from "@/lib/ui/errors";
import {
  equipCardOptimistically,
  unequipCardOptimistically,
  type InventoryDeckState,
} from "@/lib/inventory/optimistic-deck";
import type {
  InventoryCardData,
  InventorySlotData,
} from "@/lib/inventory/types";

const DRAG_CARD_MIME = "application/x-emojitsu-card";
const DRAG_SLOT_MIME = "application/x-emojitsu-slot";

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
  const [, startTransition] = useTransition();
  const [deckState, setDeckState] = useState<InventoryDeckState>({
    slots,
    collection,
  });
  const [savingKeys, setSavingKeys] = useState<string[]>([]);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [inventoryHover, setInventoryHover] = useState(false);
  const [actionError, setActionError] = useState<string | null>(
    initialError ? DECK_ERROR_MESSAGES[initialError] : null,
  );
  const rollbackRef = useRef<InventoryDeckState | null>(null);

  const unlockedSlots = deckState.slots.filter((slot) => slot.unlocked);
  const filledSlots = unlockedSlots.filter((slot) => slot.card).length;
  const isSaving = savingKeys.length > 0;

  function beginSaving(key: string) {
    setSavingKeys((current) => (current.includes(key) ? current : [...current, key]));
  }

  function endSaving(key: string) {
    setSavingKeys((current) => current.filter((entry) => entry !== key));
  }

  function runDeckMutation({
    savingKey,
    optimisticState,
    action,
  }: {
    savingKey: string;
    optimisticState: InventoryDeckState | null;
    action: () => Promise<{ ok: true } | { ok: false; error: DeckActionError }>;
  }) {
    if (!optimisticState) {
      return;
    }

    setActionError(null);
    rollbackRef.current = deckState;
    setDeckState(optimisticState);
    beginSaving(savingKey);

    startTransition(() => {
      void (async () => {
        const result = await action();

        endSaving(savingKey);

        if (!result.ok) {
          if (rollbackRef.current) {
            setDeckState(rollbackRef.current);
          }

          setActionError(DECK_ERROR_MESSAGES[result.error]);
        }
      })();
    });
  }

  function handleDragStartInventory(card: InventoryCardData, event: React.DragEvent) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_CARD_MIME, card.playerCardId);
    event.dataTransfer.setData("text/plain", card.playerCardId);
    setDragSource({ kind: "inventory", playerCardId: card.playerCardId });
  }

  function handleDragStartSlot(slot: InventorySlotData, event: React.DragEvent) {
    if (!slot.unlocked || !slot.card) {
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

    const targetSlot = deckState.slots.find((slot) => slot.slotIndex === slotIndex);

    if (!targetSlot?.unlocked) {
      return;
    }

    const playerCardId = readDraggedCardId(event);

    if (!playerCardId) {
      return;
    }

    runDeckMutation({
      savingKey: `equip:${playerCardId}:${slotIndex}`,
      optimisticState: equipCardOptimistically(deckState, playerCardId, slotIndex),
      action: () => equipDeckSlotById(playerCardId, slotIndex),
    });
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

    runDeckMutation({
      savingKey: `unequip:${slotIndex}`,
      optimisticState: unequipCardOptimistically(deckState, slotIndex),
      action: () => unequipDeckSlotByIndex(slotIndex),
    });
  }

  function clearDragState() {
    setDragSource(null);
    setHoverSlot(null);
    setInventoryHover(false);
  }

  return (
    <div className={`inventory-board panel battle-card${isSaving ? " inventory-board-saving" : ""}`}>
      <header className="inventory-board-top">
        <div className="inventory-section-title-row">
          <p className="eyebrow">Inventar</p>
          <span className="inventory-slot-count">
            {filledSlots}/{unlockedSlots.length} im Build
            {isSaving ? " · speichert..." : ""}
          </span>
        </div>
        <p className="muted inventory-board-lead">
          Karten zwischen Build und Sammlung ziehen.
        </p>
      </header>

      {actionError ? (
        <p className="muted inventory-board-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <section className="inventory-deck-section">
        <div className="inventory-section-head">
          <p className="inventory-section-label">Dein Build</p>
        </div>

        <div className="inventory-deck-panel">
          <div className="inventory-slots-row">
            {deckState.slots.map((slot) => {
              const isLocked = !slot.unlocked;
              const isHover = !isLocked && hoverSlot === slot.slotIndex;
              const isDraggingFromHere =
                dragSource?.kind === "slot" && dragSource.slotIndex === slot.slotIndex;
              const slotSaving = savingKeys.some((key) => {
                if (key === `unequip:${slot.slotIndex}`) {
                  return true;
                }

                if (key.endsWith(`:${slot.slotIndex}`)) {
                  return true;
                }

                return Boolean(
                  slot.card && key.startsWith(`equip:${slot.card.playerCardId}:`),
                );
              });

              return (
                <div
                  className={`inventory-slot${isLocked ? " inventory-slot-locked" : ""}${slotSaving ? " inventory-slot-saving" : ""}`}
                  key={slot.slotIndex}
                >
                  <div
                    className={`inventory-slot-drop${isHover ? " inventory-slot-drop-hover" : ""}${slot.card ? " inventory-slot-drop-filled" : ""}${isLocked ? " inventory-slot-drop-locked" : ""}`}
                    onDragEnd={isLocked ? undefined : clearDragState}
                    onDragLeave={
                      isLocked
                        ? undefined
                        : () => {
                            setHoverSlot((current) =>
                              current === slot.slotIndex ? null : current,
                            );
                          }
                    }
                    onDragOver={
                      isLocked
                        ? undefined
                        : (event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                            setHoverSlot(slot.slotIndex);
                          }
                    }
                    onDrop={
                      isLocked
                        ? undefined
                        : (event) => {
                            handleDropOnSlot(slot.slotIndex, event);
                            clearDragState();
                          }
                    }
                  >
                    {isLocked ? (
                      <div className="inventory-slot-locked-label">
                        Noch nicht freigeschaltet
                      </div>
                    ) : slot.card ? (
                      <div
                        className={`inventory-draggable inventory-slot-card${isDraggingFromHere ? " is-dragging" : ""}`}
                        draggable={!slotSaving}
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
                          size="sm"
                        />
                      </div>
                    ) : (
                      <div className="inventory-slot-empty">
                        {isHover ? "Hier ablegen" : "Leer"}
                      </div>
                    )}
                  </div>
                  {slot.card && !isLocked ? (
                    <button
                      className="button button-compact inventory-slot-remove"
                      disabled={slotSaving}
                      onClick={() => {
                        runDeckMutation({
                          savingKey: `unequip:${slot.slotIndex}`,
                          optimisticState: unequipCardOptimistically(
                            deckState,
                            slot.slotIndex,
                          ),
                          action: () => unequipDeckSlotByIndex(slot.slotIndex),
                        });
                      }}
                      type="button"
                    >
                      Entfernen
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="inventory-collection-section">
        <div className="inventory-section-head">
          <div className="inventory-section-title-row">
            <p className="inventory-section-label">Sammlung</p>
            {deckState.collection.length > 0 ? (
              <span className="inventory-collection-count">
                {deckState.collection.length}{" "}
                {deckState.collection.length === 1 ? "Karte" : "Karten"}
              </span>
            ) : null}
          </div>
        </div>

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
          {deckState.collection.length === 0 ? (
            <p className="muted inventory-collection-empty">
              {dragSource?.kind === "slot"
                ? "Hier ablegen, um die Karte aus dem Deck zu nehmen."
                : "Alle Karten sind im Build — oder du hast noch keine gesammelt. Gewinne Kämpfe für neue Karten."}
            </p>
          ) : (
            <div className="inventory-card-grid" aria-label="Sammlung">
              {deckState.collection.map((card) => {
                const isDragging =
                  dragSource?.kind === "inventory" &&
                  dragSource.playerCardId === card.playerCardId;
                const cardSaving = savingKeys.some((key) =>
                  key.startsWith(`equip:${card.playerCardId}:`),
                );

                return (
                  <div
                    className={`inventory-card-cell${isDragging ? " is-dragging" : ""}${cardSaving ? " inventory-card-saving" : ""}`}
                    key={card.playerCardId}
                  >
                    <div
                      className="inventory-draggable"
                      draggable={!cardSaving}
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
                        size="sm"
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
