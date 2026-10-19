import { useState } from "react";

interface DashboardProps {
  onRun: (numShoes: number) => void;
  isRunning: boolean;
  status: string;
}

export default function Dashboard({
  onRun,
  isRunning,
  status,
}: DashboardProps) {
  const [numShoes, setNumShoes] = useState("500");
  const [error, setError] = useState("");

  function handleRun() {
    const parsed = Number(numShoes);

    if (
      !Number.isSafeInteger(parsed) ||
      parsed <= 0
    ) {
      setError(
        "Enter a valid positive whole number.",
      );

      return;
    }

    setError("");
    onRun(parsed);
  }

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">B</div>

        <div>
          <h1>Baccarat Pattern Analytics</h1>

          <p>
            Eight-deck shoe simulation dashboard
          </p>
	  <br />
	  <p>
            Developed by Long Nguyen
          </p>
        </div>
      </div>

      <div className="controls">
        <label
          className="input-label"
          htmlFor="shoe-count"
        >
          Number of shoes
        </label>

        <input
          id="shoe-count"
          className="shoe-input"
          type="number"
          min="1"
          step="1"
          value={numShoes}
          onChange={(event) =>
            setNumShoes(event.target.value)
          }
          disabled={isRunning}
        />

        <button
          className="primary-button"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning
            ? "Simulating..."
            : "Run Simulation"}
        </button>

        <div className="status">
          <span
            className={`status-dot ${
              isRunning
                ? "status-running"
                : "status-ready"
            }`}
          />

          {status}
        </div>
      </div>

      {error && (
        <div className="input-error">
          {error}
        </div>
      )}
    </header>
  );
}
