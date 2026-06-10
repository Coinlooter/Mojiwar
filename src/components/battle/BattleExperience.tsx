"use client";

import { useCallback, useState } from "react";

import { BattleReplay } from "@/components/battle/BattleReplay";
import {
  BattleResultScreen,
  type BattleSummary,
} from "@/components/battle/BattleResultScreen";
import type { BattleResult } from "@/lib/game/types";

type BattlePhase = "replay" | "result";

export function BattleExperience({
  result,
  summary,
}: {
  result: BattleResult;
  summary: BattleSummary;
}) {
  const [phase, setPhase] = useState<BattlePhase>("replay");

  const showResult = useCallback(() => {
    setPhase("result");
  }, []);

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
