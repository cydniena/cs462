import React from "react";
import OverallStatusPie from "./OverallStatusPie";

const PieCharts = ({ groupedPieChartData }) => {
  return (
    <>
      <h2 className="text-center text-lg font-bold mb-4">
        Rooms Status Overview
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {Object.entries(groupedPieChartData).map(([key, data], index) => {
          const [building, floor] = key.split("|");
          return (
            <div
              key={index}
              style={{
                width: "250px",
                height: "250px",
                textAlign: "center",
              }}
            >
              <h4>
                {building} - {floor}
              </h4>
              <OverallStatusPie data={data} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PieCharts;