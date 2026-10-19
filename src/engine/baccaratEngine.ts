import type {
  Outcome,
  Side,
  Streak,
  WindowNumber,
  ZoneName,
  PairedStreakGroup,
  PairedStreakStats,
  SimulationResults,
  StreakAnalyticsRow,
  PairedStreakRow,
  ZoneAnalyticsRow,
  ZoneChartSeries,
} from "../types/baccarat";

const CARD_VALUES: Record<string, number> = {
  A: 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 0,
  J: 0,
  Q: 0,
  K: 0,
};

type Card = keyof typeof CARD_VALUES;

const RANKS = Object.keys(CARD_VALUES) as Card[];

const ZONES: ZoneName[] = [
  "Zigzag",
  "Trend",
  "Dominant",
  "Noise",
];

const PAIRED_GROUPS: PairedStreakGroup[] = [
  "Streak 1-2",
  "Streak 3-4",
  "Streak 5-6",
  "Streak 7-8",
];

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

export function createEightDeckShoe(): Card[] {
  const oneDeck: Card[] = [];

  for (const rank of RANKS) {
    for (let i = 0; i < 4; i++) {
      oneDeck.push(rank);
    }
  }

  const shoe: Card[] = [];

  for (let deck = 0; deck < 8; deck++) {
    shoe.push(...oneDeck);
  }

  return shuffle(shoe);
}

export function baccaratHandValue(cards: Card[]): number {
  return (
    cards.reduce((sum, card) => {
      return sum + CARD_VALUES[card];
    }, 0) % 10
  );
}

function playerDraws(playerValue: number): boolean {
  return playerValue <= 5;
}

function bankerDraws(
  bankerValue: number,
  playerThirdCard: Card | null,
): boolean {
  if (playerThirdCard === null) {
    return bankerValue <= 5;
  }

  const p3 = CARD_VALUES[playerThirdCard];

  if (bankerValue <= 2) return true;

  if (bankerValue === 3) return p3 !== 8;

  if (bankerValue === 4) {
    return [2, 3, 4, 5, 6, 7].includes(p3);
  }

  if (bankerValue === 5) {
    return [4, 5, 6, 7].includes(p3);
  }

  if (bankerValue === 6) {
    return [6, 7].includes(p3);
  }

  return false;
}

/**
 * Simulates one eight-deck shoe.
 *
 * Rules:
 * - The first card is used to determine the burn count.
 * - A zero-value burn card means ten additional cards.
 * - The cut-card stopping threshold is 16 cards remaining.
 * - Natural 8/9 hands stand.
 * - Player and Banker third-card rules are applied.
 * - Results are P, B, or T.
 */
export function simulateShoe(): Outcome[] {
  const shoe = createEightDeckShoe();

  // Burn card.
  const firstBurnCard = shoe.pop();

  if (firstBurnCard === undefined) {
    return [];
  }

  let burnCount = CARD_VALUES[firstBurnCard];

  if (burnCount === 0) {
    burnCount = 10;
  }

  for (let i = 0; i < burnCount; i++) {
    shoe.pop();
  }

  const cutCardIndex = 16;
  const outcomes: Outcome[] = [];

  while (shoe.length > cutCardIndex) {
    // Deal Player's first two cards.
    const p1 = shoe.pop();
    const p2 = shoe.pop();

    // Deal Banker's first two cards.
    const b1 = shoe.pop();
    const b2 = shoe.pop();

    if (
      p1 === undefined ||
      p2 === undefined ||
      b1 === undefined ||
      b2 === undefined
    ) {
      break;
    }

    const playerCards: Card[] = [p1, p2];
    const bankerCards: Card[] = [b1, b2];

    let playerValue = baccaratHandValue(playerCards);
    let bankerValue = baccaratHandValue(bankerCards);

    // Natural 8 or 9.
    if (playerValue >= 8 || bankerValue >= 8) {
      if (playerValue > bankerValue) {
        outcomes.push("P");
      } else if (bankerValue > playerValue) {
        outcomes.push("B");
      } else {
        outcomes.push("T");
      }

      continue;
    }

    // Player third card.
    let playerThirdCard: Card | null = null;

    if (playerDraws(playerValue)) {
      const thirdCard = shoe.pop();

      if (thirdCard !== undefined) {
        playerThirdCard = thirdCard;
        playerCards.push(thirdCard);
        playerValue = baccaratHandValue(playerCards);
      }
    }

    // Banker third card.
    if (bankerDraws(bankerValue, playerThirdCard)) {
      const thirdCard = shoe.pop();

      if (thirdCard !== undefined) {
        bankerCards.push(thirdCard);
        bankerValue = baccaratHandValue(bankerCards);
      }
    }

    // Final result.
    if (playerValue > bankerValue) {
      outcomes.push("P");
    } else if (bankerValue > playerValue) {
      outcomes.push("B");
    } else {
      outcomes.push("T");
    }
  }

  return outcomes;
}

function getWindow(
  index: number,
  totalHands: number,
): WindowNumber {
  if (totalHands <= 0) {
    return 1;
  }

  const window = Math.floor((index / totalHands) * 4) + 1;

  return Math.min(4, Math.max(1, window)) as WindowNumber;
}

/**
 * Extracts streaks while ignoring ties.
 *
 * Example:
 * P P T P B B T B
 *
 * Results:
 * P streak of 2
 * B streak of 2
 *
 * Ties do not break streaks.
 */
export function extractStreaks(
  outcomes: Outcome[],
): Streak[] {
  const nonTies = outcomes
    .map((side, index) => ({
      side,
      index,
    }))
    .filter(
      (
        item,
      ): item is { side: Side; index: number } =>
        item.side !== "T",
    );

  if (nonTies.length === 0) {
    return [];
  }

  const totalHands = outcomes.length;
  const streaks: Streak[] = [];

  let currentSide = nonTies[0].side;
  let currentLength = 0;
  let currentStartIndex = nonTies[0].index;

  for (const item of nonTies) {
    if (item.side === currentSide) {
      currentLength++;
    } else {
      streaks.push({
        length: currentLength,
        side: currentSide,
        startIndex: currentStartIndex,
        window: getWindow(
          currentStartIndex,
          totalHands,
        ),
      });

      currentSide = item.side;
      currentLength = 1;
      currentStartIndex = item.index;
    }
  }

  if (currentLength > 0) {
    streaks.push({
      length: currentLength,
      side: currentSide,
      startIndex: currentStartIndex,
      window: getWindow(
        currentStartIndex,
        totalHands,
      ),
    });
  }

  return streaks;
}

export function classifyZones(
  outcomes: Outcome[],
  streaks: Streak[],
): Record<WindowNumber, ZoneName> {
  const result = {} as Record<WindowNumber, ZoneName>;

  const totalHands = outcomes.length;

  for (let w = 1; w <= 4; w++) {
    const window = w as WindowNumber;

    const windowStreaks = streaks.filter(
      (streak) => streak.window === window,
    );

    const windowOutcomes = outcomes.filter(
      (outcome, index) =>
        getWindow(index, totalHands) === window &&
        outcome !== "T",
    );

    if (windowOutcomes.length === 0) {
      result[window] = "Noise";
      continue;
    }

    const playerCount = windowOutcomes.filter(
      (outcome) => outcome === "P",
    ).length;

    const bankerCount = windowOutcomes.filter(
      (outcome) => outcome === "B",
    ).length;

    const totalNonTies = windowOutcomes.length;

    const skew =
      Math.max(playerCount, bankerCount) /
      totalNonTies;

    const lengths = windowStreaks.map(
      (streak) => streak.length,
    );

    // Classification precedence.
    if (skew >= 0.65 && totalNonTies >= 5) {
      result[window] = "Dominant";
    } else if (
      lengths.length > 0 &&
      lengths.every((length) => length <= 2)
    ) {
      result[window] = "Zigzag";
    } else if (
      lengths.length > 0 &&
      lengths.every(
        (length) => length >= 3 && length <= 5,
      )
    ) {
      result[window] = "Trend";
    } else {
      result[window] = "Noise";
    }
  }

  return result;
}

function emptyWindowCounts(): Record<number, number> {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
}

function emptyZoneCounts(): Record<ZoneName, number> {
  return {
    Zigzag: 0,
    Trend: 0,
    Dominant: 0,
    Noise: 0,
  };
}

function getPairedGroup(
  length: number,
): PairedStreakGroup | null {
  if (length <= 2) return "Streak 1-2";

  if (length <= 4) return "Streak 3-4";

  if (length <= 6) return "Streak 5-6";

  if (length <= 8) return "Streak 7-8";

  return null;
}

export function runSimulation(
  numShoes: number,
): SimulationResults {
  if (
    !Number.isSafeInteger(numShoes) ||
    numShoes <= 0
  ) {
    throw new Error(
      "Number of shoes must be a positive integer.",
    );
  }

  const streakFreq: Record<number, number> = {};

  const streakWinFreq: Record<
    number,
    Record<number, number>
  > = {};

  const zoneFreq = emptyZoneCounts();

  const zoneWinFreq: Record<
    ZoneName,
    Record<number, number>
  > = {
    Zigzag: emptyWindowCounts(),
    Trend: emptyWindowCounts(),
    Dominant: emptyWindowCounts(),
    Noise: emptyWindowCounts(),
  };

  const pairedCounts: Record<
    PairedStreakGroup,
    number[]
  > = {
    "Streak 1-2": [],
    "Streak 3-4": [],
    "Streak 5-6": [],
    "Streak 7-8": [],
  };

  let totalHands = 0;
  let totalPlayerWins = 0;
  let totalBankerWins = 0;
  let totalTies = 0;

  for (let shoeNumber = 0; shoeNumber < numShoes; shoeNumber++) {
    const outcomes = simulateShoe();

    totalHands += outcomes.length;

    totalPlayerWins += outcomes.filter(
      (outcome) => outcome === "P",
    ).length;

    totalBankerWins += outcomes.filter(
      (outcome) => outcome === "B",
    ).length;

    totalTies += outcomes.filter(
      (outcome) => outcome === "T",
    ).length;

    const streaks = extractStreaks(outcomes);

    const zones = classifyZones(
      outcomes,
      streaks,
    );

    const currentPairedCounts: Record<
      PairedStreakGroup,
      number
    > = {
      "Streak 1-2": 0,
      "Streak 3-4": 0,
      "Streak 5-6": 0,
      "Streak 7-8": 0,
    };

    for (const streak of streaks) {
      const { length, window } = streak;

      streakFreq[length] =
        (streakFreq[length] ?? 0) + 1;

      if (!streakWinFreq[length]) {
        streakWinFreq[length] = emptyWindowCounts();
      }

      streakWinFreq[length][window]++;

      const group = getPairedGroup(length);

      if (group !== null) {
        currentPairedCounts[group]++;
      }
    }

    for (const group of PAIRED_GROUPS) {
      pairedCounts[group].push(
        currentPairedCounts[group],
      );
    }

    for (let w = 1; w <= 4; w++) {
      const window = w as WindowNumber;
      const zone = zones[window];

      zoneFreq[zone]++;
      zoneWinFreq[zone][window]++;
    }
  }

  // Calculate paired streak statistics.
  const pairedStats = {} as Record<
    PairedStreakGroup,
    PairedStreakStats
  >;

  for (const group of PAIRED_GROUPS) {
    const counts = pairedCounts[group];

    const total = counts.reduce(
      (sum, value) => sum + value,
      0,
    );

    pairedStats[group] = {
      shoeLow: Math.min(...counts),
      shoeAvg: total / numShoes,
      shoeHigh: Math.max(...counts),
      simTotal: total,
      simAvg: total / numShoes,
    };
  }

  // Prepare streak analytics.
  const totalStreaks = Object.values(
    streakFreq,
  ).reduce((sum, value) => sum + value, 0);

  const streakRows: StreakAnalyticsRow[] =
    Object.keys(streakFreq)
      .map(Number)
      .sort((a, b) => a - b)
      .map((length) => {
        const totalHits = streakFreq[length];

        const counts = [1, 2, 3, 4].map(
          (window) =>
            streakWinFreq[length][window],
        );

        const percentages = counts.map(
          (count) =>
            totalHits > 0
              ? (count / totalHits) * 100
              : 0,
        );

        const maxCount = Math.max(...counts);

        // First window wins ties, matching Python's max behavior.
        const topWindowIndex = counts.indexOf(maxCount);

        const topWindow = (
          topWindowIndex + 1
        ) as WindowNumber;

        return {
          length,
          totalHits,
          avgShoe: totalHits / numShoes,
          pctSim:
            totalStreaks > 0
              ? (totalHits / totalStreaks) * 100
              : 0,
          topWindow,
          topWindowPct: percentages[topWindowIndex],
          windowCounts: counts,
          windowPercentages: percentages,
        };
      });

  // Prepare paired streak rows.
  const pairedRows: PairedStreakRow[] =
    PAIRED_GROUPS.map((group) => ({
      group,
      stats: pairedStats[group],
    }));

  // Prepare zone analytics.
  const totalZoneHits = Object.values(
    zoneFreq,
  ).reduce((sum, value) => sum + value, 0);

  const zoneRows: ZoneAnalyticsRow[] =
    ZONES.map((zone) => {
      const totalHits = zoneFreq[zone];

      const counts = [1, 2, 3, 4].map(
        (window) => zoneWinFreq[zone][window],
      );

      const percentages = counts.map(
        (count) =>
          totalHits > 0
            ? (count / totalHits) * 100
            : 0,
      );

      return {
        zone,
        totalHits,
        avgShoe: totalHits / numShoes,
        pctSim:
          totalZoneHits > 0
            ? (totalHits / totalZoneHits) * 100
            : 0,
        windowCounts: counts,
        windowPercentages: percentages,
      };
    });

  const chartData: ZoneChartSeries[] =
    ZONES.map((zone) => ({
      zone,
      values: zoneRows.find(
        (row) => row.zone === zone,
      )!.windowPercentages,
    }));

  return {
    numShoes,
    totalHands,
    totalPlayerWins,
    totalBankerWins,
    totalTies,
    streakFreq,
    streakWinFreq,
    zoneFreq,
    zoneWinFreq,
    pairedStats,
    streakRows,
    pairedRows,
    zoneRows,
    chartData,
  };
}
