import { BattleReplay } from "@/components/battle/BattleReplay";
import { simulateBattle } from "@/lib/game/battle-engine";
import { starterCards } from "@/lib/game/cards";

const result = simulateBattle({
  seed: "demo-route",
  attacker: {
    id: "attacker",
    ownerUserId: "demo-a",
    emoji: "🦊",
    name: "Foxy",
    level: 4,
    xp: 280,
    baseStats: {
      hp: 110,
      attack: 19,
      defense: 7,
      speed: 13,
      critChance: 0.08,
    },
    deck: [starterCards[0], starterCards[3], starterCards[6]],
  },
  defender: {
    id: "defender",
    ownerUserId: "demo-b",
    emoji: "🐸",
    name: "Hopser",
    level: 3,
    xp: 190,
    baseStats: {
      hp: 126,
      attack: 16,
      defense: 9,
      speed: 9,
      critChance: 0.05,
    },
    deck: [starterCards[1], starterCards[2], starterCards[4]],
  },
});

export default function DemoBattlePage() {
  return (
    <>
      <section style={{ marginBottom: 32 }}>
        <p className="eyebrow">Animierter Rundenkampf</p>
        <h1>Replay aus serverseitigem Battle-Log.</h1>
        <p className="lead">
          Die Demo zeigt das Zielverhalten: Der Kampf ist bereits entschieden,
          die UI spielt nur das gespeicherte Log Schritt fuer Schritt ab.
        </p>
      </section>

      <BattleReplay result={result} />
    </>
  );
}
