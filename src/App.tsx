import {
  useCallback,
  useState,
} from "react";

import Dashboard from "./components/Dashboard";
import StreakAnalytics from "./components/StreakAnalytics";
import PairedStreakAnalytics from "./components/PairedStreakAnalytics";
import ZoneAnalytics from "./components/ZoneAnalytics";
import ZoneChart from "./components/ZoneChart";

import { runSimulation } from "./engine/baccaratEngine";

import type {
  SimulationResults,
} from "./types/baccarat";

import "./index.css";

export default function App() {
  const [results, setResults] =
    useState<SimulationResults | null>(null);

  const [isRunning, setIsRunning] =
    useState(false);

  const [status, setStatus] =
    useState("Ready");

  const [error, setError] =
    useState("");

  const handleRun = useCallback(
    (numShoes: number) => {
      setIsRunning(true);
      setError("");
      setStatus("Preparing simulation...");

      window.setTimeout(() => {
        try {
          setStatus("Simulating shoes...");

          const simulationResults =
            runSimulation(numShoes);

          setResults(simulationResults);

          setStatus(
            `Completed ${numShoes.toLocaleString()} shoes`,
          );
        } catch (simulationError) {
          const message =
            simulationError instanceof Error
              ? simulationError.message
              : "Simulation failed.";

          setError(message);
          setStatus("Simulation failed");
        } finally {
          setIsRunning(false);
        }
      }, 30);
    },
    [],
  );

  const totalWins =
    (results?.totalPlayerWins ?? 0) +
    (results?.totalBankerWins ?? 0);

  const playerWinPct =
    totalWins > 0
      ? ((results?.totalPlayerWins ?? 0) /
          totalWins) *
        100
      : 0;

  const bankerWinPct =
    totalWins > 0
      ? ((results?.totalBankerWins ?? 0) /
          totalWins) *
        100
      : 0;

  const tiePct =
    results && results.totalHands > 0
      ? (results.totalTies /
          results.totalHands) *
        100
      : 0;

  return (
    <main className="app-shell">
      <Dashboard
        onRun={handleRun}
        isRunning={isRunning}
        status={status}
      />

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <section className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">
            Shoes Simulated
          </span>

          <strong>
            {results
              ? results.numShoes.toLocaleString()
              : "—"}
          </strong>

          <span className="summary-caption">
            Eight-deck shoes
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Total Hands
          </span>

          <strong>
            {results
              ? results.totalHands.toLocaleString()
              : "—"}
          </strong>

          <span className="summary-caption">
            All simulated shoes
          </span>
        </div>

        <div className="summary-card player-card">
          <span className="summary-label">
            Player Wins
          </span>

          <strong>
            {results
              ? results.totalPlayerWins.toLocaleString()
              : "—"}
          </strong>

          <span className="summary-caption">
            {results
              ? `${playerWinPct.toFixed(2)}% of non-tie hands`
              : "Waiting for simulation"}
          </span>
        </div>

        <div className="summary-card banker-card">
          <span className="summary-label">
            Banker Wins
          </span>

          <strong>
            {results
              ? results.totalBankerWins.toLocaleString()
              : "—"}
          </strong>

          <span className="summary-caption">
            {results
              ? `${bankerWinPct.toFixed(2)}% of non-tie hands`
              : "Waiting for simulation"}
          </span>
        </div>

        <div className="summary-card tie-card">
          <span className="summary-label">
            Ties
          </span>

          <strong>
            {results
              ? results.totalTies.toLocaleString()
              : "—"}
          </strong>

          <span className="summary-caption">
            {results
              ? `${tiePct.toFixed(2)}% of all hands`
              : "Waiting for simulation"}
          </span>
        </div>
      </section>

      <nav className="section-nav">
        <a href="#streaks">
          Streak Analytics
        </a>

        <a href="#paired">
          Paired Streaks
        </a>

        <a href="#zones">
          Zone Analysis
        </a>

        <a href="#chart">
          Distribution Chart
        </a>
      </nav>

      <div className="dashboard-content">
        <section id="streaks">
          <StreakAnalytics
            rows={results?.streakRows ?? []}
          />
        </section>

        <section id="paired">
          <PairedStreakAnalytics
            rows={results?.pairedRows ?? []}
          />
        </section>

        <section id="zones">
          <ZoneAnalytics
            rows={results?.zoneRows ?? []}
            chartData={results?.chartData ?? []}
          />
        </section>

        <section id="chart">
          <ZoneChart
            data={results?.chartData ?? []}
          />
        </section>

        <section className="methodology-panel">
          <h2>Simulation Methodology</h2>

          <div className="methodology-grid">
            <div>
              <span>Decks</span>
              <strong>8</strong>
            </div>

            <div>
              <span>Cards per shoe</span>
              <strong>416</strong>
            </div>

            <div>
              <span>Cut-card threshold</span>
              <strong>16 cards</strong>
            </div>

            <div>
              <span>Window count</span>
              <strong>4</strong>
            </div>
          </div>

          <p>
            This dashboard simulates randomized
            eight-deck shoes and summarizes
            simulation results. Ties are excluded
            when calculating Player/Banker streaks.
            A tie does not break an existing streak.
          </p>

          <p className="disclaimer">
            Simulation frequencies describe the
            generated sample. They do not guarantee
            future outcomes or establish a
            profitable betting strategy.
          </p>
        </section>
      </div>

      <footer className="app-footer">
        <span>
          Baccarat Pattern &amp; Zone Simulation
        </span>

        <span>
          Developed by Long Nguyen
        </span>
      </footer>
    </main>
  );
}
