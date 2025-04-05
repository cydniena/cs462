import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BuildingVisualization = ({ utilizationData, opportunityData, selectedBuilding }) => {
  // Filter data based on selected building
  const filterByBuilding = (data) => {
    if (!selectedBuilding) return data;
    
    const buildingName = selectedBuilding === "SCIS1" 
      ? "School of Computing & Information Systems 1"
      : "School of Economics/School of Computing & Information Systems 2";
    
    return data.filter(item => item.building === buildingName);
  };

  const filteredUtilizationData = filterByBuilding(utilizationData);
  const filteredOpportunityData = filterByBuilding(opportunityData);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "20px",
      marginBottom: "30px"
    }}>
      {/* Not Booked but Utilized Rooms */}
      <div style={{ height: "400px" }}>
        <h3>Not Booked but Utilized Rooms</h3>
        <Bar
          data={{
            labels: filteredUtilizationData.map((item) => {
              const shortName = item.building.includes("School of Computing & Information Systems 1")
                ? "SCIS1"
                : "SOE/SCIS2";
              return `${shortName} - ${item.floor}`;
            }),
            datasets: [{
              label: "% Not Booked but Utilized",
              data: filteredUtilizationData.map((item) =>
                parseFloat(item.unbookedUtilizedPercentage)
              ),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, max: 100 }
            }
          }}
        />
      </div>

      {/* Booked but Unutilized Rooms */}
      <div style={{ height: "400px" }}>
        <h3>Booked but Unutilized Rooms</h3>
        <Bar
          data={{
            labels: filteredUtilizationData.map((item) => {
              const shortName = item.building.includes("School of Computing & Information Systems 1")
                ? "SCIS1"
                : "SOE/SCIS2";
              return `${shortName} - ${item.floor}`;
            }),
            datasets: [{
              label: "% Booked but Unutilized",
              data: filteredUtilizationData.map((item) =>
                parseFloat(item.bookedUnutilizedPercentage)
              ),
              backgroundColor: "rgba(255, 99, 132, 0.6)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, max: 100 }
            }
          }}
        />
      </div>

      {/* Not Booked and Unutilized Rooms */}
      <div style={{ height: "400px" }}>
        <h3>Not Booked and Unutilized Rooms</h3>
        <Bar
          data={{
            labels: filteredOpportunityData.map((item) => {
              const shortName = item.building.includes("School of Computing & Information Systems 1")
                ? "SCIS1"
                : "SOE/SCIS2";
              return `${shortName} - ${item.floor}`;
            }),
            datasets: [{
              label: "% Not Booked and Unutilized",
              data: filteredOpportunityData.map((item) =>
                parseFloat(item.opportunityPercentage)
              ),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, max: 100 }
            }
          }}
        />
      </div>
    </div>
  );
};

export default BuildingVisualization;