import type {
  ZoneChartSeries,
} from "../types/baccarat";

interface ZoneChartProps {
  data: ZoneChartSeries[];
}

const WINDOW_LABELS = [
  "Window 1",
  "Window 2",
  "Window 3",
  "Window 4",
];

export default function ZoneChart({
  data,
}: ZoneChartProps) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((series) => series.values),
  );

  return (
    <section className="panel" id="distribution-chart">
      <div className="panel-heading">
        <div>
          <h2>Distribution Chart</h2>

          <p>
            Zone classification frequencies across
            the four windows of simulated baccarat shoes.
          </p>
        </div>

        <span className="badge">
          {data.length} zones
        </span>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          Run a simulation to display the distribution chart.
        </div>
      ) : (
        <>
          <div className="distribution-chart">
            {data.map((series) => (
              <div
                className="distribution-series"
                key={series.zone}
              >
                <h3
                  className={`zone-badge zone-${series.zone.toLowerCase()}`}
                >
                  {series.zone}
                </h3>

                {series.values.map((value, index) => {
                  const width =
                    (value / maxValue) * 100;

                  return (
                    <div
                      className="distribution-row"
                      key={`${series.zone}-${index}`}
                    >
                      <span className="distribution-label">
                        {WINDOW_LABELS[index] ??
                          `Window ${index + 1}`}
                      </span>

                      <div className="distribution-track">
                        <div
                          className={`distribution-bar zone-bar-${series.zone.toLowerCase()}`}
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <strong className="distribution-value">
                        {value.toLocaleString()}
                      </strong>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="chart-legend">
            <span>
              Bars show relative frequency within
              the largest displayed value.
            </span>
          </div>
        </>
      )}
    </section>
  );
}
