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
    <>
      <section style={{ marginBottom: 32 }}>
        <p className="eyebrow">Kampf laeuft</p>
        <h1>Schau zu, wie der Kampf ablaeuft.</h1>
        <p className="lead">
          Gleich danach siehst du dein Ergebnis und eventuelle Beute.
        </p>
      </section>

      <BattleReplay onComplete={showResult} result={result} />
    </>
  );
}
