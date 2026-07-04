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

const EcoScoreBreakDownChart = ({ scoreData }) => {
  // console.log(scoreData);
  
  const data = {
    labels: ["Ingredients", "Packaging", "CarbonFootprint", "Specifications"],

    datasets: [
      {
        label: "Eco Score Breakdown",
        data: [
          scoreData.ingredientTypeScore,
          scoreData.packagingTypeScore,
          scoreData.carbonFootprintScore,
          scoreData.specificationsScore,
        ],
        backgroundColor: ["#198754", "#20c997", "#6f42c1", "#0dcaf0"],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 22,
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
          label: (context) => `${context.raw}/25`,
        },
      },
    },

    scales: {
      x: {
        min: 0,
        max: 25,

        grid: {
          drawBorder: false,
        },

        ticks: {
          callback: (value) => `${value}%`,
        },
      },

      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  // const COLORS = ["#16a34a", "#3a82f6", "#f97316", "#a855f7"];

  // const renderCustomizedLabel = ({
  //   cx,
  //   cy,
  //   midAngle,
  //   innerRadius,
  //   outerRadius,
  //   percent,
  //   value,
  // }) => {
  //   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

  //   const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);

  //   const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  //   return (
  //     <text
  //       x={x}
  //       y={y}
  //       fill="white"
  //       textAnchor="middle"
  //       dominantBaseline="central"
  //       fontSize={16}
  //       fontWeight="normals"
  //     >
  //       {value}
  //     </text>
  //   );
  // };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="fw-bold mb-1">Eco Score Breakdown</h5>

        <p className="text-muted small mb-4">
          Individual sustainability metrics
        </p>

        <div style={{ height: "280px" }}>
          <Bar data={data} options={options} />
        </div>

        <div className="mt-4">
          <div className="d-flex justify-content-between">
            <span className="fw-medium">Overall Eco Score</span>

            <span className="fw-bold text-success">78/100</span>
          </div>
        </div>
      </div>
    </div>
    // <div style={{ height: 350 }}>
    //   <Radar data={data} options={options} />
    // </div>

    // // <PieChart
    // //   className="d-flex justify-content-between p-3"
    // //   width="100%"
    // //   height={200}
    // // >
    // //   <Pie
    // //     data={data}
    // //     datakey="value"
    // //     innerRadius={60}
    // //     outerRadius={100}
    // //     paddingAngle={3}
    // //     label={renderCustomizedLabel}
    // //     labelLine={false}
    // //   >
    // //     {data.map((entry, index) => (
    // //       <Cell key={index} fill={COLORS[index]} />
    // //     ))}
    // //   </Pie>
    // //   <Tooltip />
    // //   <div className="d-flex flex-column justify-content-center">
    // //     <Legend layout="vertical" verticalAlign="middle" align="right" />
    // //   </div>
    // // </PieChart>
  );
};

export default EcoScoreBreakDownChart;
