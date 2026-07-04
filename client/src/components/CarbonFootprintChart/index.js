import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CarbonFootprintChart = ({ carbonFootprintScore, carbonFootprint }) => {
  console.log(carbonFootprintScore);
  const maxScore = 25;

  const getRating = () => {
    if (carbonFootprintScore <= 5) return "High Impact";
    if (carbonFootprintScore <= 10) return "Moderate Impact";
    if (carbonFootprintScore <= 15) return "Good";
    if (carbonFootprintScore <= 20) return "Very Good";
    return "Excellent";
  };

  const data = {
    labels: ["Carbon Footprint"],
    datasets: [
      {
        data: [carbonFootprintScore],
        backgroundColor: "#198754",
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 28,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw}/${maxScore}`,
        },
      },
    },

    scales: {
      x: {
        min: 0,
        max: maxScore,

        grid: {
          display: false,
          drawBorder: false,
        },

        ticks: {
          stepSize: 5,
        },

        border: {
          display: false,
        },
      },

      y: {
        grid: {
          display: false,
        },

        ticks: {
          display: false,
        },

        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold mb-0">Carbon Footprint</h5>

          <span className="badge bg-success">{getRating()}</span>
        </div>

        <p className="text-muted small mb-3">
          Lower environmental impact based on estimated carbon emissions.
        </p>

        <small className="fw-bold">
          {carbonFootprint} kg CO
          <sub>2e</sub>
          <small> per unit</small>
        </small>

        <div className="text-center mb-3">
          <h1 className="fw-bold text-success">
            {carbonFootprintScore}
            <span className="fs-5 text-dark">/{maxScore}</span>
          </h1>
        </div>

        <div style={{ height: "50px" }}>
          <Bar data={data} options={options} />
        </div>

        <div className="d-flex justify-content-between mt-2 small text-muted">
          <span>0</span>
          <span>25</span>
        </div>

        <hr />

        <div className="small text-muted">
          Products with higher scores generally have lower carbon emissions
          during manufacturing, packaging, and transport.
        </div>
      </div>
    </div>

    // <div className="w-75 d-flex flex-column">
    //   <h6 className="fw-bold mb-3">Carbon Footprint Rating</h6>
    //   <ResponsiveContainer width="100%" height={250}>
    //     <ComposedChart data={data}>
    //       <CartesianGrid strokeDasharray="3 3" vertical={false} />

    //       <XAxis dataKey="level" />

    //       <YAxis domain={[0, 25]} ticks={[0, 5, 10, 15, 20, 25]} />

    //       <Tooltip />

    //       <Area
    //         type="monotone"
    //         dataKey="score"
    //         fill="#22c55e"
    //         fillOpacity={0.08}
    //         stroke="none"
    //       />

    //       <Line
    //         type="monotone"
    //         dataKey="score"
    //         stroke="#22c55e"
    //         strokeWidth={3}
    //         dot={(props) => {
    //           const { cx, cy, payload } = props;
    //           if (cx === undefined || cy === undefined) {
    //             return null;
    //           }
    //           if (payload.level === "Your Product") {
    //             return (
    //               <g>
    //                 <circle
    //                   cx={cx}
    //                   cy={cy}
    //                   r={8}
    //                   fill="#1919d6"
    //                   stroke="#fff"
    //                   strokeWidth={3}
    //                 />
    //                 <text
    //                   x={cx}
    //                   y={cy - 15}
    //                   textAnchor="middle"
    //                   fontSize="12"
    //                   fontWeight="bold"
    //                   fill="#1919d6"
    //                 >
    //                   {payload.score}
    //                 </text>
    //               </g>
    //             );
    //           }

    //           return <circle cx={cx} cy={cy} r={4} fill="#22c55e" />;
    //         }}
    //       />
    //     </ComposedChart>
    //   </ResponsiveContainer>
    // </div>
  );
};

export default CarbonFootprintChart;
