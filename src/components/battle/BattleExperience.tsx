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
    return <BattleResultScreen summary={summary} />;
  }

  return (
    <section className="battle-phase-screen" aria-label="Kampf">
      <article className="panel battle-card battle-experience-card">
        <BattleReplay onComplete={showResult} result={result} />
      </article>
    </section>
  );
}
