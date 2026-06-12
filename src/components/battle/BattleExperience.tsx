"use client";

import { useCallback, useState, useTransition } from "react";

import { markBattleViewed } from "@/app/battle/actions";
import { BattleReplay } from "@/components/battle/BattleReplay";
import {
  BattleResultScreen,
  type BattleSummary,
} from "@/components/battle/BattleResultScreen";
import type { BattleResult } from "@/lib/game/types";

type BattlePhase = "replay" | "result";

export function BattleExperience({
  battleId,
  result,
  summary,
}: {
  battleId?: string;
  result: BattleResult;
  summary: BattleSummary;
}) {
  const [phase, setPhase] = useState<BattlePhase>("replay");
  const [, startTransition] = useTransition();

  const showResult = useCallback(() => {
    if (battleId) {
      startTransition(() => {
        void markBattleViewed(battleId);
      });
    }

    setPhase("result");
  }, [battleId]);

  if (phase === "result") {
    return <BattleResultScreen events={result.events} summary={summary} />;
  }

  return (
    <section
      aria-label="Kampf"
      className="battle-phase-screen battle-phase-screen-arena"
    >
      <article className="battle-experience-card battle-experience-arena">
        <BattleReplay onComplete={showResult} result={result} />
      </article>
    </section>
  );
}
