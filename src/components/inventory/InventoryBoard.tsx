"use client";

import { useRef, useState, useTransition } from "react";

import {
  equipDeckSlotById,
  equipTalismanSlotById,
  unequipDeckSlotByIndex,
  unequipTalismanSlotByIndex,
  type DeckActionError,
} from "@/app/deck/actions";
import { GameCard } from "@/components/cards/GameCard";
import { DECK_ERROR_MESSAGES } from "@/lib/ui/errors";
import {
  equipCardOptimistically,
  unequipCardOptimistically,
  type InventoryDeckState,
} from "@/lib/inventory/optimistic-deck";
import {
  equipTalismanOptimistically,
  unequipTalismanOptimistically,
  type InventoryTalismanState,
} from "@/lib/inventory/optimistic-talisman";
import type {
  InventoryCardData,
  InventorySlotData,
  InventoryTalismanData,
  InventoryTalismanSlotData,
} from "@/lib/inventory/types";

const DRAG_CARD_MIME = "application/x-emojitsu-card";
const DRAG_SLOT_MIME = "application/x-emojitsu-slot";
const DRAG_TALISMAN_MIME = "application/x-emojitsu-talisman";
const DRAG_TALISMAN_SLOT_MIME = "application/x-emojitsu-talisman-slot";

type CardDragSource =
  | { kind: "inventory"; playerCardId: string }
  | { kind: "slot"; playerCardId: string; slotIndex: number };

type TalismanDragSource =
  | { kind: "talisman-inventory"; playerTalismanId: string }
  | { kind: "talisman-slot"; playerTalismanId: string; slotIndex: number };

export function InventoryBoard({
  slots,
  collection,
  talismanSlots,
  talismanCollection,
  initialError,
}: {
  slots: InventorySlotData[];
  collection: InventoryCardData[];
  talismanSlots: InventoryTalismanSlotData[];
  talismanCollection: InventoryTalismanData[];
  initialError: DeckActionError | null;
}) {
  const [, startTransition] = useTransition();
  const [deckState, setDeckState] = useState<InventoryDeckState>({
    slots,
    collection,
  });
  const [talismanState, setTalismanState] = useState<InventoryTalismanState>({
    slots: talismanSlots,
    collection: talismanCollection,
  });
  const [savingKeys, setSavingKeys] = useState<string[]>([]);
  const [cardDragSource, setCardDragSource] = useState<CardDragSource | null>(null);
  const [talismanDragSource, setTalismanDragSource] =
    useState<TalismanDragSource | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [hoverTalismanSlot, setHoverTalismanSlot] = useState<number | null>(null);
  const [stashHover, setStashHover] = useState(false);
  const [actionError, setActionError] = useState<string | null>(
    initialError ? DECK_ERROR_MESSAGES[initialError] : null,
  );
  const deckRollbackRef = useRef<InventoryDeckState | null>(null);
  const talismanRollbackRef = useRef<InventoryTalismanState | null>(null);

  const unlockedSlots = deckState.slots.filter((slot) => slot.unlocked);
  const filledSlots = unlockedSlots.filter((slot) => slot.card).length;
  const filledTalismanSlots = talismanState.slots.filter((slot) => slot.talisman).length;
  const stashCount = deckState.collection.length + talismanState.collection.length;
  const isSaving = savingKeys.length > 0;
  const isUnequipDrag =
    cardDragSource?.kind === "slot" || talismanDragSource?.kind === "talisman-slot";

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
    deckRollbackRef.current = deckState;
    setDeckState(optimisticState);
    beginSaving(savingKey);

    startTransition(() => {
      void (async () => {
        const result = await action();

        endSaving(savingKey);

        if (!result.ok) {
          if (deckRollbackRef.current) {
            setDeckState(deckRollbackRef.current);
          }

          setActionError(DECK_ERROR_MESSAGES[result.error]);
        }
      })();
    });
  }

  function runTalismanMutation({
    savingKey,
    optimisticState,
    action,
  }: {
    savingKey: string;
    optimisticState: InventoryTalismanState | null;
    action: () => Promise<{ ok: true } | { ok: false; error: DeckActionError }>;
  }) {
    if (!optimisticState) {
      return;
    }

    setActionError(null);
    talismanRollbackRef.current = talismanState;
    setTalismanState(optimisticState);
    beginSaving(savingKey);

    startTransition(() => {
      void (async () => {
        const result = await action();

        endSaving(savingKey);

        if (!result.ok) {
          if (talismanRollbackRef.current) {
            setTalismanState(talismanRollbackRef.current);
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
    setCardDragSource({ kind: "inventory", playerCardId: card.playerCardId });
  }

  function handleDragStartSlot(slot: InventorySlotData, event: React.DragEvent) {
    if (!slot.unlocked || !slot.card) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_CARD_MIME, slot.card.playerCardId);
    event.dataTransfer.setData(DRAG_SLOT_MIME, String(slot.slotIndex));
    event.dataTransfer.setData("text/plain", slot.card.playerCardId);
    setCardDragSource({
      kind: "slot",
      playerCardId: slot.card.playerCardId,
      slotIndex: slot.slotIndex,
    });
  }

  function handleDragStartTalismanInventory(
    talisman: InventoryTalismanData,
    event: React.DragEvent,
  ) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_TALISMAN_MIME, talisman.playerTalismanId);
    event.dataTransfer.setData("text/plain", talisman.playerTalismanId);
    setTalismanDragSource({
      kind: "talisman-inventory",
      playerTalismanId: talisman.playerTalismanId,
    });
  }

  function handleDragStartTalismanSlot(
    slot: InventoryTalismanSlotData,
    event: React.DragEvent,
  ) {
    if (!slot.talisman) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_TALISMAN_MIME, slot.talisman.playerTalismanId);
    event.dataTransfer.setData(DRAG_TALISMAN_SLOT_MIME, String(slot.slotIndex));
    event.dataTransfer.setData("text/plain", slot.talisman.playerTalismanId);
    setTalismanDragSource({
      kind: "talisman-slot",
      playerTalismanId: slot.talisman.playerTalismanId,
      slotIndex: slot.slotIndex,
    });
  }

  function readDraggedCardId(event: React.DragEvent) {
    return (
      event.dataTransfer.getData(DRAG_CARD_MIME) ||
      event.dataTransfer.getData("text/plain")
    );
  }

  function readDraggedTalismanId(event: React.DragEvent) {
    return (
      event.dataTransfer.getData(DRAG_TALISMAN_MIME) ||
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

  function handleDropOnTalismanSlot(slotIndex: number, event: React.DragEvent) {
    event.preventDefault();
    setHoverTalismanSlot(null);

    const playerTalismanId = readDraggedTalismanId(event);

    if (!playerTalismanId) {
      return;
    }

    runTalismanMutation({
      savingKey: `equip-talisman:${playerTalismanId}:${slotIndex}`,
      optimisticState: equipTalismanOptimistically(
        talismanState,
        playerTalismanId,
        slotIndex,
      ),
      action: () => equipTalismanSlotById(playerTalismanId, slotIndex),
    });
  }

  function handleDropOnStash(event: React.DragEvent) {
    event.preventDefault();
    setStashHover(false);

    const sourceCardSlotRaw = event.dataTransfer.getData(DRAG_SLOT_MIME);

    if (sourceCardSlotRaw) {
      const slotIndex = Number(sourceCardSlotRaw);

      if (!Number.isNaN(slotIndex)) {
        runDeckMutation({
          savingKey: `unequip:${slotIndex}`,
          optimisticState: unequipCardOptimistically(deckState, slotIndex),
          action: () => unequipDeckSlotByIndex(slotIndex),
        });
      }

      return;
    }

    const sourceTalismanSlotRaw = event.dataTransfer.getData(DRAG_TALISMAN_SLOT_MIME);

    if (!sourceTalismanSlotRaw) {
      return;
    }

    const slotIndex = Number(sourceTalismanSlotRaw);

    if (Number.isNaN(slotIndex)) {
      return;
    }

    runTalismanMutation({
      savingKey: `unequip-talisman:${slotIndex}`,
      optimisticState: unequipTalismanOptimistically(talismanState, slotIndex),
      action: () => unequipTalismanSlotByIndex(slotIndex),
    });
  }

  function clearDragState() {
    setCardDragSource(null);
    setTalismanDragSource(null);
    setHoverSlot(null);
    setHoverTalismanSlot(null);
    setStashHover(false);
  }

  function renderTalismanSlot(slot: InventoryTalismanSlotData) {
    const isHover = hoverTalismanSlot === slot.slotIndex;
    const isDraggingFromHere =
      talismanDragSource?.kind === "talisman-slot" &&
      talismanDragSource.slotIndex === slot.slotIndex;
    const slotSaving = savingKeys.some((key) => {
      if (key === `unequip-talisman:${slot.slotIndex}`) {
        return true;
      }

      if (key.endsWith(`:${slot.slotIndex}`) && key.startsWith("equip-talisman:")) {
        return true;
      }

      return Boolean(
        slot.talisman && key.startsWith(`equip-talisman:${slot.talisman.playerTalismanId}:`),
      );
    });

    return (
      <div
        className={`inventory-slot inventory-talisman-slot${slotSaving ? " inventory-slot-saving" : ""}`}
        key={slot.slotIndex}
      >
        <div
          className={`inventory-slot-drop inventory-talisman-slot-drop${isHover ? " inventory-slot-drop-hover" : ""}${slot.talisman ? " inventory-slot-drop-filled" : ""}`}
          onDragEnd={clearDragState}
          onDragLeave={() => {
            setHoverTalismanSlot((current) =>
              current === slot.slotIndex ? null : current,
            );
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setHoverTalismanSlot(slot.slotIndex);
          }}
          onDrop={(event) => {
            handleDropOnTalismanSlot(slot.slotIndex, event);
            clearDragState();
          }}
        >
          {slot.talisman ? (
            <div
              className={`inventory-draggable inventory-slot-card inventory-slot-talisman-card${isDraggingFromHere ? " is-dragging" : ""}`}
              draggable={!slotSaving}
              onDragEnd={clearDragState}
              onDragStart={(event) => {
                handleDragStartTalismanSlot(slot, event);
              }}
            >
              <GameCard
                active
                description={slot.talisman.description}
                emoji={slot.talisman.emoji}
                name={slot.talisman.name}
                rarity={slot.talisman.rarity}
                size="sm"
                variant="talisman"
              />
            </div>
          ) : (
            <div className="inventory-slot-empty inventory-slot-empty-octagon">
              {isHover ? "Ablegen" : "Talisman"}
            </div>
          )}
        </div>
        {slot.talisman ? (
          <button
            className="button button-compact inventory-slot-remove"
            disabled={slotSaving}
            onClick={() => {
              runTalismanMutation({
                savingKey: `unequip-talisman:${slot.slotIndex}`,
                optimisticState: unequipTalismanOptimistically(
                  talismanState,
                  slot.slotIndex,
                ),
                action: () => unequipTalismanSlotByIndex(slot.slotIndex),
              });
            }}
            type="button"
          >
            Entfernen
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`inventory-board panel battle-card${isSaving ? " inventory-board-saving" : ""}`}>
      {actionError ? (
        <p className="muted inventory-board-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <section className="inventory-build-section">
        <header className="inventory-section-head">
          <div className="inventory-section-title-row">
            <p className="inventory-section-label">Build</p>
            <span className="inventory-slot-count">
              {filledSlots}/{unlockedSlots.length} Karten · {filledTalismanSlots}/
              {talismanState.slots.length} Talisman
              {isSaving ? " · speichert..." : ""}
            </span>
          </div>
        </header>

        <div className="inventory-build-panel">
          <div className="inventory-build-layout">
            <div className="inventory-build-talisman" aria-label="Talisman-Slot">
              {talismanState.slots.map(renderTalismanSlot)}
            </div>

            <div className="inventory-build-cards" aria-label="Karten-Slots">
              <div className="inventory-slots-row">
                {deckState.slots.map((slot) => {
                  const isLocked = !slot.unlocked;
                  const isHover = !isLocked && hoverSlot === slot.slotIndex;
                  const isDraggingFromHere =
                    cardDragSource?.kind === "slot" &&
                    cardDragSource.slotIndex === slot.slotIndex;
                  const slotSaving = savingKeys.some((key) => {
                    if (key === `unequip:${slot.slotIndex}`) {
                      return true;
                    }

                    if (key.endsWith(`:${slot.slotIndex}`) && key.startsWith("equip:")) {
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
                            Gesperrt
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
                            {isHover ? "Ablegen" : "Leer"}
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
          </div>
        </div>
      </section>

      <section className="inventory-stash-section">
        <header className="inventory-section-head">
          <div className="inventory-section-title-row">
            <p className="inventory-section-label">Inventar</p>
            {stashCount > 0 ? (
              <span className="inventory-collection-count">
                {stashCount} {stashCount === 1 ? "Objekt" : "Objekte"}
              </span>
            ) : null}
          </div>
        </header>

        <div
          className={`inventory-stash${stashHover ? " inventory-stash-hover" : ""}${isUnequipDrag ? " inventory-stash-unequip" : ""}`}
          onDragEnd={clearDragState}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) {
              return;
            }

            setStashHover(false);
          }}
          onDragOver={(event) => {
            const canUnequip =
              cardDragSource?.kind === "slot" ||
              talismanDragSource?.kind === "talisman-slot" ||
              event.dataTransfer.types.includes(DRAG_SLOT_MIME) ||
              event.dataTransfer.types.includes(DRAG_TALISMAN_SLOT_MIME);

            if (!canUnequip) {
              return;
            }

            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setStashHover(true);
          }}
          onDrop={(event) => {
            handleDropOnStash(event);
            clearDragState();
          }}
        >
          {stashCount === 0 ? (
            <p className="muted inventory-stash-empty">
              {cardDragSource?.kind === "slot"
                ? "Hier ablegen, um die Karte aus dem Build zu nehmen."
                : talismanDragSource?.kind === "talisman-slot"
                  ? "Hier ablegen, um den Talisman aus dem Build zu nehmen."
                  : "Gesammelte Karten und Talismane erscheinen hier. Gewinne Kämpfe für neue Beute."}
            </p>
          ) : (
            <div className="inventory-stash-grid" aria-label="Inventar">
              {deckState.collection.map((card) => {
                const isDragging =
                  cardDragSource?.kind === "inventory" &&
                  cardDragSource.playerCardId === card.playerCardId;
                const cardSaving = savingKeys.some((key) =>
                  key.startsWith(`equip:${card.playerCardId}:`),
                );

                return (
                  <div
                    className={`inventory-stash-cell inventory-stash-cell-card${isDragging ? " is-dragging" : ""}${cardSaving ? " inventory-card-saving" : ""}`}
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

              {talismanState.collection.map((talisman) => {
                const isDragging =
                  talismanDragSource?.kind === "talisman-inventory" &&
                  talismanDragSource.playerTalismanId === talisman.playerTalismanId;
                const talismanSaving = savingKeys.some((key) =>
                  key.startsWith(`equip-talisman:${talisman.playerTalismanId}:`),
                );

                return (
                  <div
                    className={`inventory-stash-cell inventory-stash-cell-talisman${isDragging ? " is-dragging" : ""}${talismanSaving ? " inventory-card-saving" : ""}`}
                    key={talisman.playerTalismanId}
                  >
                    <div
                      className="inventory-draggable"
                      draggable={!talismanSaving}
                      onDragEnd={clearDragState}
                      onDragStart={(event) => {
                        handleDragStartTalismanInventory(talisman, event);
                      }}
                    >
                      <GameCard
                        description={talisman.description}
                        emoji={talisman.emoji}
                        name={talisman.name}
                        rarity={talisman.rarity}
                        size="sm"
                        variant="talisman"
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
