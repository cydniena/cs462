// import React, { useMemo } from "react";
// import { startOfWeek, endOfWeek } from "date-fns";

// const FloorHeatMap = ({
//   occupancyData = [],
//   timeRange = "",
//   selectedDate = "",
//   selectedHour = "",
// }) => {

//   // Filtered data based on selected date, filter type, and selected hour
//   const filteredData = useMemo(() => {
//     if (!occupancyData || occupancyData.length === 0) return [];
//     const selectedStart = new Date(selectedDate);

//     if (timeRange === "week") {
//       const weekStart = startOfWeek(selectedStart, { weekStartsOn: 1 }); // Monday
//       const weekEnd = endOfWeek(selectedStart, { weekStartsOn: 1 }); // Sunday
//       return occupancyData.filter(({ Time }) => {
//         const date = new Date(Time);
//         return date >= weekStart && date <= weekEnd;
//       });
//     } else if (timeRange === "day") {
//       return occupancyData.filter(({ Time }) => {
//         const date = new Date(Time);
//         return date.toDateString() === selectedStart.toDateString();
//       });
//     } else if (timeRange === "hour") {
//       const selectedHourInt = parseInt(selectedHour, 10); // Convert hour to integer
//       return occupancyData.filter(({ Time }) => {
//         const date = new Date(Time);
//         return (
//           date.toDateString() === selectedStart.toDateString() &&
//           date.getHours() === selectedHourInt
//         );
//       });
//     }

//     return [];
//   }, [occupancyData, timeRange, selectedDate, selectedHour]);

//   // Table data preparation for hourly usage
//   const tableData = useMemo(() => {
//     if (!Array.isArray(filteredData) || filteredData.length === 0) return [];

//     const rooms = Array.from(
//       new Set(filteredData.map(({ FacilityName }) => FacilityName))
//     );

//     // Define the hours (8 AM - 10 PM)
//     const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`);

//     return hours.map((hour) => {
//       const hourData = { id: hour };
//       rooms.forEach((room) => {
//         const entriesForHour = filteredData.filter(({ FacilityName, Time }) => {
//           const date = new Date(Time);
//           return FacilityName === room && `${date.getHours()}:00` === hour;
//         });

//         if (timeRange === "week") {
//           const totalUsage = entriesForHour.reduce(
//             (acc, entry) => acc + (entry.Count || 0),
//             0
//           );
//           const averageUsage =
//             entriesForHour.length > 0 ? totalUsage / entriesForHour.length : 0;
//           hourData[room] = averageUsage;
//         } else if (timeRange === "day" || timeRange === "hour") {
//           const entry = entriesForHour.length > 0 ? entriesForHour[0] : null;
//           hourData[room] = entry && entry.Count > 0 ? 1 : 0; // Shaded if used
//         }
//       });
//       return hourData;
//     });
//   }, [filteredData, timeRange]);

//   const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8 AM - 10 PM
//   const roomIds = Array.from(
//     new Set(filteredData.map(({ FacilityName }) => FacilityName))
//   );

//   return (
//     <div className="p-4">
//       <h1>Heatmap for each floor</h1>
//       <div className="flex space-x-4 mb-4 items-center">
//         <table className="table-auto border-collapse border border-gray-300 w-full">
//           <thead>
//             <tr>
//               <th className="border border-gray-300 p-2">Room</th>
//               {hours.map((hour) => (
//                 <th key={hour} className="border border-gray-300 p-2">
//                   {hour}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {roomIds.map((roomId) => (
//               <tr key={roomId}>
//                 <td className="border border-gray-300 p-2">{roomId}</td>
//                 {hours.map((hour) => {
//                   const hourData = tableData.find((h) => h.id === hour);
//                   const usage = hourData && hourData[roomId];

//                   let bgColor = "transparent"; // Default color (unshaded)
//                   if (timeRange === "week") {
//                     // Shading for weekly view based on average usage
//                     if (usage > 0.8) bgColor = "orange";
//                     else if (usage > 0.5) bgColor = "yellow";
//                     else if (usage > 0.2) bgColor = "lightgreen";
//                   } else if (timeRange === "day" || timeRange === "hour") {
//                     // Shading for daily or hourly view (fully utilized is orange)
//                     bgColor = usage > 0 ? "orange" : "transparent";
//                   }

//                   return (
//                     <td
//                       key={hour}
//                       className="border border-gray-300 p-2"
//                       style={{
//                         backgroundColor: bgColor,
//                       }}
//                     ></td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default FloorHeatMap;
import React, { useMemo } from "react";
import { startOfWeek, endOfWeek } from "date-fns";

const FloorHeatMap = ({
  occupancyData = [],
  selectedDate = "",
}) => {

  // Filtered data based on selected week
  const filteredData = useMemo(() => {
    if (!occupancyData || occupancyData.length === 0) return [];
    const selectedStart = new Date(selectedDate);

    const weekStart = startOfWeek(selectedStart, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(selectedStart, { weekStartsOn: 1 }); // Sunday
    return occupancyData.filter(({ Time }) => {
      const date = new Date(Time);
      return date >= weekStart && date <= weekEnd;
    });
  }, [occupancyData, selectedDate]);

  // Table data preparation for weekly usage
  const tableData = useMemo(() => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];

    const rooms = Array.from(
      new Set(filteredData.map(({ FacilityName }) => FacilityName))
    );

    // Define the hours (8 AM - 10 PM)
    const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`);

    return hours.map((hour) => {
      const hourData = { id: hour };
      rooms.forEach((room) => {
        const entriesForHour = filteredData.filter(({ FacilityName, Time }) => {
          const date = new Date(Time);
          return FacilityName === room && `${date.getHours()}:00` === hour;
        });

        const totalUsage = entriesForHour.reduce(
          (acc, entry) => acc + (entry.Count || 0),
          0
        );
        const averageUsage =
          entriesForHour.length > 0 ? totalUsage / entriesForHour.length : 0;
        hourData[room] = averageUsage;
      });
      return hourData;
    });
  }, [filteredData]);

  const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8 AM - 10 PM
  const roomIds = Array.from(
    new Set(filteredData.map(({ FacilityName }) => FacilityName))
  );

  return (
    <div className="p-4">
      <h1>Heatmap for each floor</h1>
      <div className="flex space-x-4 mb-4 items-center">
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Room</th>
              {hours.map((hour) => (
                <th key={hour} className="border border-gray-300 p-2">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roomIds.map((roomId) => (
              <tr key={roomId}>
                <td className="border border-gray-300 p-2">{roomId}</td>
                {hours.map((hour) => {
                  const hourData = tableData.find((h) => h.id === hour);
                  const usage = hourData && hourData[roomId];

                  let bgColor = "transparent"; // Default color (unshaded)
                  // Shading for weekly view based on average usage
                  if (usage > 0.8) bgColor = "orange";
                  else if (usage > 0.5) bgColor = "yellow";
                  else if (usage > 0.2) bgColor = "lightgreen";

                  return (
                    <td
                      key={hour}
                      className="border border-gray-300 p-2"
                      style={{
                        backgroundColor: bgColor,
                      }}
                    ></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FloorHeatMap;