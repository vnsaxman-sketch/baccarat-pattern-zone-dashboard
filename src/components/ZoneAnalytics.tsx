import type {
  ZoneAnalyticsRow,
  ZoneChartSeries,
} from "../types/baccarat";

import {
  formatDecimal,
  formatInteger,
  formatPercent,
} from "../utils/formatters";

import ZoneChart from "./ZoneChart";

interface Props {
  rows: ZoneAnalyticsRow[];
  chartData: ZoneChartSeries[];
}

export default function ZoneAnalytics({
  rows,
  chartData,
}: Props) {
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Zone & Window Analysis</h2>

            <p>
              Classification frequency and
              distribution across four windows.
            </p>
          </div>

          <span className="badge">
            4 zones
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Zone Classification</th>
                <th>Total Windows</th>
                <th>Avg Hits / Shoe</th>
                <th>% of Total Zones</th>
                <th>Window 1</th>
                <th>Window 2</th>
                <th>Window 3</th>
                <th>Window 4</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="empty-state"
                  >
                    Run a simulation to display
                    zone analysis.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.zone}>
                    <td>
                      <span
                        className={`zone-badge zone-${row.zone.toLowerCase()}`}
                      >
                        {row.zone}
                      </span>
                    </td>

                    <td>
                      {formatInteger(
                        row.totalHits,
                      )}
                    </td>

                    <td>
                      {formatDecimal(
                        row.avgShoe,
                      )}
                    </td>

                    <td>
                      {formatPercent(
                        row.pctSim,
                      )}
                    </td>

                    {row.windowPercentages.map(
                      (value, index) => (
                        <td key={index}>
                          {formatPercent(
                            value,
                            1,
                          )}
                        </td>
                      ),
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="zone-definitions">
          <div>
            <span className="definition-title">
              Zigzag
            </span>

            <p>
              All streaks in the window have
              length 1 or 2.
            </p>
          </div>

          <div>
            <span className="definition-title">
              Trend
            </span>

            <p>
              All streaks in the window have
              lengths from 3 to 5.
            </p>
          </div>

          <div>
            <span className="definition-title">
              Dominant
            </span>

            <p>
              Player or Banker accounts for at
              least 65% of non-tie outcomes, with
              at least five non-tie hands.
            </p>
          </div>

          <div>
            <span className="definition-title">
              Noise
            </span>

            <p>
              Patterns that do not meet the
              other classification rules.
            </p>
          </div>
        </div>
      </section>

      <ZoneChart data={chartData} />
    </>
  );
}
