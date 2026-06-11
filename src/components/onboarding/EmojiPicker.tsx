"use client";

import { useState } from "react";

import { STARTER_EMOJIS } from "@/constants/starter-emojis";

export function EmojiPicker() {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  return (
    <div className="emoji-picker">
      <p className="field-label" id="emoji-picker-label">
        Wähle dein Emoji
      </p>
      <input name="emoji" required type="hidden" value={selectedEmoji ?? ""} />
      <div
        aria-labelledby="emoji-picker-label"
        className="emoji-picker-grid"
        role="radiogroup"
      >
        {STARTER_EMOJIS.map((emoji) => {
          const isSelected = selectedEmoji === emoji;

          return (
            <button
              aria-checked={isSelected}
              aria-label={`Emoji ${emoji}`}
              className={`emoji-picker-option${isSelected ? " is-selected" : ""}`}
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              role="radio"
              type="button"
            >
              <span aria-hidden>{emoji}</span>
            </button>
          );
        })}
      </div>
      <p className="muted emoji-picker-hint">
        {selectedEmoji
          ? `Dein Held: ${selectedEmoji}`
          : "Tippe auf ein Emoji, das dir gefällt."}
      </p>
    </div>
  );
}
