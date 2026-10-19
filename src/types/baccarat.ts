export type Outcome = "P" | "B" | "T";

export type Side = "P" | "B";

export type ZoneName =
  | "Zigzag"
  | "Trend"
  | "Dominant"
  | "Noise";

export type WindowNumber = 1 | 2 | 3 | 4;

export interface Streak {
  length: number;
  side: Side;
  startIndex: number;
  window: WindowNumber;
}

export interface PairedStreakStats {
  shoeLow: number;
  shoeAvg: number;
  shoeHigh: number;
  simTotal: number;
  simAvg: number;
}

export type PairedStreakGroup =
  | "Streak 1-2"
  | "Streak 3-4"
  | "Streak 5-6"
  | "Streak 7-8";

export interface StreakAnalyticsRow {
  length: number;
  totalHits: number;
  avgShoe: number;
  pctSim: number;
  topWindow: WindowNumber;
  topWindowPct: number;
  windowCounts: number[];
  windowPercentages: number[];
}

export interface PairedStreakRow {
  group: PairedStreakGroup;
  stats: PairedStreakStats;
}

export interface ZoneAnalyticsRow {
  zone: ZoneName;
  totalHits: number;
  avgShoe: number;
  pctSim: number;
  windowCounts: number[];
  windowPercentages: number[];
}

export interface ZoneChartSeries {
  zone: ZoneName;
  values: number[];
}

export interface SimulationResults {
  numShoes: number;

  totalHands: number;
  totalPlayerWins: number;
  totalBankerWins: number;
  totalTies: number;

  streakFreq: Record<number, number>;

  streakWinFreq: Record<number, Record<number, number>>;

  zoneFreq: Record<ZoneName, number>;

  zoneWinFreq: Record<ZoneName, Record<number, number>>;

  pairedStats: Record<PairedStreakGroup, PairedStreakStats>;

  streakRows: StreakAnalyticsRow[];

  pairedRows: PairedStreakRow[];

  zoneRows: ZoneAnalyticsRow[];

  chartData: ZoneChartSeries[];
}
