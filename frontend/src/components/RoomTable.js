import React from "react";

const RoomTable = ({ data }) => {
  return (
    <table className="min-w-full border-collapse border border-gray-200 text-center">
      <thead className="bg-gray-100">
        <tr>
          <th className="border border-gray-300 px-4 py-2">Facility</th>
          <th className="border border-gray-300 px-4 py-2">Time</th>
          <th className="border border-gray-300 px-4 py-2">Count</th>
          <th className="border border-gray-300 px-4 py-2">Capacity</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">{row.Facility}</td>
            <td className="border border-gray-300 px-4 py-2">{row.Time}</td>
            <td className="border border-gray-300 px-4 py-2">{row.Count}</td>
            <td className="border border-gray-300 px-4 py-2">{row.Capacity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RoomTable;
