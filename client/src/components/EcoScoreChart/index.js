import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, plugins } from "chart.js";
import "./index.css";
import getEcoScoreCaption from "./getEcoScoreCaption";
import { BsBorderWidth } from "react-icons/bs";

ChartJS.register(ArcElement, Tooltip);

const EcoScoreChart = ({ ecoScore }) => {
  console.log(ecoScore);
  const data = {
    datasets: [
      {
        data: [ecoScore, 100 - ecoScore],
        backgroundColor: ["#198754", "#e9ecef"],
        borderWidth: 0,
        cutout: "80%",
        borderRadius: 10,
      },
    ],
  };

  const options = {
    plugins: {
      Tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  const ecoScoreCaption = getEcoScoreCaption(ecoScore);

  return (
    <div
      className="card shadow-sm p-4"
      style={{ maxWidth: "400px", margin: "auto" }}
    >
      <h4 className="text-center mb-3">Sustainability Score</h4>

      <div
        style={{
          height: "200px",
          position: "relative",
        }}
      >
        <Doughnut data={data} options={options} />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <h1 className="fw-bold mb-0">{ecoScore}</h1>

          <small className="text-muted">Out of 100</small>
        </div>
      </div>

      <div className="text-center mt-3">
        {(ecoScore >= 80 && (
          <h6 className="text-success">Excellent Performance</h6>
        )) ||
          ((ecoScore >= 70) & (ecoScore < 80) && (
            <h6 className="text-success">Great Performance</h6>
          )) ||
          ((ecoScore >= 60) & (ecoScore < 70) && (
            <h6 className="text-success">Good Performance</h6>
          )) ||
          ((ecoScore >= 50) & (ecoScore < 60) && (
            <h6 className="text-success">Moderate Performance</h6>
          )) ||
          ((ecoScore >= 40) & (ecoScore < 50) && (
            <h6 className="text-success">Normal Performance</h6>
          )) ||
          ((ecoScore >= 30) & (ecoScore < 40) && (
            <h6 className="text-danger">Low Performance</h6>
          ))}
        <small className="text-muted">{ecoScoreCaption}</small>
      </div>
    </div>
  );
};

export default EcoScoreChart;
