import type {
  StreakAnalyticsRow,
} from "../types/baccarat";

import {
  formatDecimal,
  formatInteger,
  formatPercent,
} from "../utils/formatters";

interface Props {
  rows: StreakAnalyticsRow[];
}

export default function StreakAnalytics({
  rows,
}: Props) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Streak Analytics</h2>

          <p>
            Streak lengths and their distribution
            across four shoe windows.
          </p>
        </div>

        <span className="badge">
          {rows.length} streak lengths
        </span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Streak Length</th>
              <th>Total Hits</th>
              <th>Avg Hits / Shoe</th>
              <th>% of Total Streaks</th>
              <th>Most Frequent Window</th>
              <th>
                Window Distribution
                <br />
                W1 | W2 | W3 | W4
              </th>
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
                  streak analytics.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.length}>
                  <td>
                    <span className="streak-label">
                      {row.length}
                    </span>
                  </td>

                  <td>
                    {formatInteger(row.totalHits)}
                  </td>

                  <td>
                    {formatDecimal(row.avgShoe)}
                  </td>

                  <td>
                    {formatPercent(row.pctSim)}
                  </td>

                  <td>
                    Window {row.topWindow}
                    <span className="muted">
                      {" "}
                      (
                      {formatPercent(
                        row.topWindowPct,
                        1,
                      )}
                      )
                    </span>
                  </td>

                  <td>
                    <div className="window-distribution">
                      {row.windowCounts.map(
                        (count, index) => (
                          <span
                            key={index}
                            className={`window-chip window-${index + 1}`}
                            title={`Window ${
                              index + 1
                            }: ${formatPercent(
                              row.windowPercentages[
                                index
                              ],
                              1,
                            )}`}
                          >
                            W{index + 1}:{" "}
                            {formatInteger(count)}
                          </span>
                        ),
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
