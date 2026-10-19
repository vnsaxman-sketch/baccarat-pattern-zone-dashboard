import type {
  PairedStreakRow,
} from "../types/baccarat";

import {
  formatDecimal,
  formatInteger,
} from "../utils/formatters";

interface Props {
  rows: PairedStreakRow[];
}

export default function PairedStreakAnalytics({
  rows,
}: Props) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Paired Streak Metrics</h2>

          <p>
            Low, average, and high occurrences
            per shoe.
          </p>
        </div>

        <span className="badge">
          4 groups
        </span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Streak Group</th>
              <th>Per Shoe: Low</th>
              <th>Per Shoe: Average</th>
              <th>Per Shoe: High</th>
              <th>Simulation Total</th>
              <th>Average Hits / Shoe</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="empty-state"
                >
                  Run a simulation to display
                  paired streak metrics.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.group}>
                  <td>
                    <span className="group-label">
                      {row.group}
                    </span>
                  </td>

                  <td>{row.stats.shoeLow}</td>

                  <td>
                    {formatDecimal(
                      row.stats.shoeAvg,
                    )}
                  </td>

                  <td>{row.stats.shoeHigh}</td>

                  <td>
                    {formatInteger(
                      row.stats.simTotal,
                    )}
                  </td>

                  <td>
                    {formatDecimal(
                      row.stats.simAvg,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="info-note">
        <strong>How to read these metrics:</strong>

        <span>
          Low and high are the minimum and maximum
          counts observed in any single simulated
          shoe. Average is the mean count per shoe
          across the entire simulation.
        </span>
      </div>
    </section>
  );
}
