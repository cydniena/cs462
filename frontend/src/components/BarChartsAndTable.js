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

const BarChartsAndTable = ({
  utilizationData,
  opportunityData,
  timeFilter,
  mergedTableData,
}) => {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={{ height: "400px" }}>
          <h3>Not Booked but Utilized Rooms</h3>
          <Bar
            data={{
              labels: opportunityData.map((item) => {
                const shortName =
                  item.building ===
                  "School of Computing & Information Systems 1"
                    ? "SCIS1"
                    : "SOE/SCIS2";
                return `${shortName} - ${item.floor}`;
              }),
              datasets: [
                {
                  label: "% Not Booked but Utilized",
                  data: utilizationData.map((item) =>
                    parseFloat(item.unbookedUtilizedPercentage)
                  ),
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: "Percentage (%)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Building and Floor",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    afterLabel: function (context) {
                      const data = utilizationData[context.dataIndex];
                      if (data.unbookedUtilizedCount === 0) {
                        return "All rooms are properly booked or unutilized";
                      }

                      const roomDetails = data.unbookedUtilizedRooms.map(
                        (room) => {
                          if (timeFilter === "hour") {
                            return `• ${room.name}: ${room.count}/${room.capacity} people`;
                          } else {
                            return `• ${room.name} (usage varies)`;
                          }
                        }
                      );

                      return [
                        `Unbooked but Utilized Rooms (${data.unbookedUtilizedCount}/${data.totalRooms}):`,
                        ...roomDetails,
                      ].join("\n");
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div style={{ height: "400px" }}>
          <h3>Booked but Unutilized Rooms</h3>
          <Bar
            data={{
              labels: opportunityData.map((item) => {
                const shortName =
                  item.building ===
                  "School of Computing & Information Systems 1"
                    ? "SCIS1"
                    : "SOE/SCIS2";
                return `${shortName} - ${item.floor}`;
              }),
              datasets: [
                {
                  label: "% Booked but Unutilized",
                  data: utilizationData.map((item) =>
                    parseFloat(item.bookedUnutilizedPercentage)
                  ),
                  backgroundColor: "rgba(255, 99, 132, 0.6)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: "Percentage (%)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Building and Floor",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    afterLabel: function (context) {
                      const data = utilizationData[context.dataIndex];
                      if (data.bookedUnutilizedCount === 0) {
                        return "No booked but unutilized rooms";
                      }

                      const roomDetails = data.bookedUnutilizedRooms.map(
                        (room) => {
                          return `• ${room.name} (0/${room.capacity} people)`;
                        }
                      );

                      return [
                        `Booked but Unutilized Rooms (${data.bookedUnutilizedCount}/${data.totalRooms}):`,
                        ...roomDetails,
                      ].join("\n");
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div style={{ height: "400px" }}>
          <h3>Not Booked and Unutilized Rooms</h3>
          <Bar
            data={{
              labels: opportunityData.map((item) => {
                const shortName =
                  item.building ===
                  "School of Computing & Information Systems 1"
                    ? "SCIS1"
                    : "SOE/SCIS2";
                return `${shortName} - ${item.floor}`;
              }),
              datasets: [
                {
                  label: "% Not Booked and Unutilized",
                  data: opportunityData.map((item) =>
                    parseFloat(item.opportunityPercentage)
                  ),
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: "Percentage (%)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Building and Floor",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    afterLabel: function (context) {
                      const data = opportunityData[context.dataIndex];
                      if (data.opportunityCount === 0) {
                        return "No unbooked and unutilized rooms";
                      }

                      const roomDetails = data.opportunityRoomDetails.map(
                        (room) => {
                          return `• ${room.name} (0/${room.capacity} people)`;
                        }
                      );

                      return [
                        `Unbooked and Unutilized Rooms (${data.opportunityCount}/${data.totalRooms}):`,
                        ...roomDetails,
                      ].join("\n");
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div style={{ overflowX: "auto", marginTop: "80px" }}>
        <h3>Comprehensive Room Utilization Data</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Building
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Floor
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Total Rooms
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Unbooked & Utilized
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                %
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Booked & Unutilized
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                %
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Not Booked & Unutilized
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {mergedTableData.map((data, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "12px", textAlign: "left" }}>
                  {data.building}
                </td>
                <td style={{ padding: "12px", textAlign: "left" }}>
                  {data.floor}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {data.totalRooms}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {data.unbookedUtilizedCount}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {data.unbookedUtilizedPercentage}%
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {data.bookedUnutilizedCount}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {data.bookedUnutilizedPercentage}%
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {data.opportunityRooms}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {data.opportunityPercentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BarChartsAndTable;