import { cardDropBases } from "./cards";
import {
  AFFIX_POOL,
  buildAffixFromTemplate,
  LEGENDARY_AFFIX_POOL,
  type AffixTemplate,
} from "./affixes";
import { pickWeighted } from "./random";
import type { CardAffix, CardRarity, RolledCardDrop } from "./types";

export const QUALITY_TIER_CONFIG: Record<
  CardRarity,
  { affixCount: number; statMultiplier: number; weight: number }
> = {
  common: { affixCount: 1, statMultiplier: 1, weight: 55 },
  rare: { affixCount: 2, statMultiplier: 1.2, weight: 28 },
  epic: { affixCount: 3, statMultiplier: 1.5, weight: 13 },
  legendary: { affixCount: 3, statMultiplier: 2, weight: 4 },
};

const QUALITY_TITLE: Record<CardRarity, string[]> = {
  common: ["", "Robuster", "Harter"],
  rare: ["Mächtiger", "Verzauberter", "Glühender"],
  epic: ["Infernaler", "Mythischer", "Donnernder"],
  legendary: ["Ur", "Ewiger", "Königlicher"],
};

const QUALITY_SUFFIX: Record<CardRarity, string[]> = {
  common: [""],
  rare: ["der Macht", "des Sturms"],
  epic: ["der Glut", "des Donners", "der Wut"],
  legendary: ["des Ursturms", "der Ewigkeit", "der Legende"],
};

function rollQuality(random: () => number): CardRarity {
  return pickWeighted<CardRarity>(
    (Object.entries(QUALITY_TIER_CONFIG) as Array<[CardRarity, { weight: number }]>).map(
      ([quality, config]) => ({
        item: quality,
        weight: config.weight,
      }),
    ),
    random,
  );
}

function pickUniqueAffixes(
  pool: AffixTemplate[],
  count: number,
  random: () => number,
): AffixTemplate[] {
  const available = [...pool];
  const picked: AffixTemplate[] = [];

  for (let index = 0; index < count && available.length > 0; index += 1) {
    const slot = Math.floor(random() * available.length);
    const [affix] = available.splice(slot, 1);

    if (affix) {
      picked.push(affix);
    }
  }

  return picked;
}

function joinAffixLabels(affixes: CardAffix[]) {
  if (affixes.length === 0) {
    return "";
  }

  if (affixes.length === 1) {
    return affixes[0].label;
  }

  if (affixes.length === 2) {
    return `${affixes[0].label} und ${affixes[1].label}`;
  }

  return `${affixes[0].label}, ${affixes[1].label} und ${affixes[2].label}`;
}

export function buildCardDisplayName({
  baseName,
  quality,
  affixes,
  legendaryAffix,
  random,
}: {
  baseName: string;
  quality: CardRarity;
  affixes: CardAffix[];
  legendaryAffix?: CardAffix;
  random: () => number;
}) {
  const titlePool = QUALITY_TITLE[quality];
  const suffixPool = QUALITY_SUFFIX[quality];
  const title = titlePool[Math.floor(random() * titlePool.length)] ?? "";
  const suffix = suffixPool[Math.floor(random() * suffixPool.length)] ?? "";
  const affixPart = joinAffixLabels(affixes);

  if (quality === "common") {
    return affixPart ? `${affixPart}er ${baseName}` : baseName;
  }

  if (quality === "rare") {
    return affixPart
      ? `${title} ${affixPart} ${baseName}`.trim()
      : `${title} ${baseName}`.trim();
  }

  if (quality === "epic") {
    const core = affixPart ? `${affixPart} ${baseName}` : baseName;
    return suffix ? `${title} ${core} ${suffix}`.trim() : `${title} ${core}`.trim();
  }

  const legendaryCore = affixPart ? `${affixPart} ${baseName}` : baseName;
  const legendaryTitle = title ? `${title}-${legendaryCore}` : legendaryCore;
  const withSuffix = suffix ? `${legendaryTitle} ${suffix}` : legendaryTitle;

  if (legendaryAffix) {
    return `${withSuffix} [${legendaryAffix.label}]`.trim();
  }

  return withSuffix.trim();
}

export function buildCardDescription(
  affixes: CardAffix[],
  legendaryAffix?: CardAffix,
) {
  const lines = affixes.map((affix) => affix.description);

  if (legendaryAffix) {
    lines.push(`★ ${legendaryAffix.description}`);
  }

  return lines.join(" · ");
}

export function rollCardDrop(random: () => number): RolledCardDrop {
  const quality = rollQuality(random);
  const config = QUALITY_TIER_CONFIG[quality];
  const baseIndex = Math.floor(random() * cardDropBases.length);
  const base = cardDropBases[baseIndex] ?? cardDropBases[0];
  const affixTemplates = pickUniqueAffixes(AFFIX_POOL, config.affixCount, random);
  const affixes = affixTemplates.map((template) =>
    buildAffixFromTemplate(template, config.statMultiplier),
  );
  const legendaryTemplate =
    quality === "legendary"
      ? pickUniqueAffixes(LEGENDARY_AFFIX_POOL, 1, random)[0]
      : undefined;
  const legendaryAffix = legendaryTemplate
    ? buildAffixFromTemplate(legendaryTemplate, config.statMultiplier)
    : undefined;
  const displayName = buildCardDisplayName({
    baseName: base.nameStem,
    quality,
    affixes,
    legendaryAffix,
    random,
  });

  return {
    baseCardId: base.id,
    emoji: base.emoji,
    quality,
    displayName,
    affixes,
    legendaryAffix,
    description: buildCardDescription(affixes, legendaryAffix),
  };
}
