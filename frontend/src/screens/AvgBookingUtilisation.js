import React, { useState } from "react";

const AvgBookingUtilisation = ({ bookings, occupancyData }) => {
  // Get unique room names from the bookings data
  const roomNames = [...new Set(bookings.map((b) => b.FacilityName))];

  // Limit hours to 8 AM to 10 PM (i.e., hours 8 to 22)
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  // State for filters
  const [selectedRoom, setSelectedRoom] = useState(roomNames[0] || "");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today
  const [selectedHour, setSelectedHour] = useState(""); // For hour filter (empty means no filter)

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateUtilization = () => {
    // Filter bookings by room, date, and optionally hour
    const filteredBookings = bookings.filter(
      (booking) =>
        booking.BookingStatus === "Confirmed" &&
        booking.FacilityName === selectedRoom &&
        isSameDay(new Date(booking.BookingStartTime), new Date(selectedDate)) &&
        // Hour filter logic: Show bookings that overlap with the selected hour
        (selectedHour === "" ||
          (new Date(booking.BookingStartTime).getHours() <= selectedHour &&
            new Date(booking.BookingEndTime).getHours() > selectedHour)) // Changed >= to >
    );

    return filteredBookings.map((booking) => {
      const {
        BookingReferenceNumber,
        BookingStartTime,
        BookingEndTime,
        FacilityName,
      } = booking;

      const startTime = new Date(BookingStartTime);
      const endTime = new Date(BookingEndTime);

      // Filter occupancy data for the selected room, date, and hour
      const relevantOccupancy = occupancyData.filter((entry) => {
        const entryTime = new Date(entry.Time);
        return (
          entry.FacilityName === FacilityName &&
          isSameDay(entryTime, startTime) &&
          entryTime >= startTime &&
          entryTime < endTime &&
          (selectedHour === "" ||
            entryTime.getHours() === parseInt(selectedHour)) // Apply hour filter
        );
      });

      // Sum total count and get capacity
      const totalCount = relevantOccupancy.reduce(
        (sum, entry) => sum + entry.Count,
        0
      );
      const capacity =
        relevantOccupancy.length > 0 ? relevantOccupancy[0].Capacity : 1; // Avoid division by zero

      // Hourly average utilization (existing calculation)
      const hourlyUtilisation =
        (totalCount / (capacity * relevantOccupancy.length)) * 100 || 0;

      // **Whole Booking Average Utilisation** calculation:
      // Loop through the hours between startTime and endTime and collect the occupancy data.
      const bookingOccupancy = [];
      for (let hour = startTime.getHours(); hour < endTime.getHours(); hour++) {
        const hourOccupancy = occupancyData.filter((entry) => {
          const entryTime = new Date(entry.Time);
          return (
            entry.FacilityName === FacilityName &&
            entryTime.getHours() === hour &&
            isSameDay(entryTime, startTime) &&
            entryTime >= startTime &&
            entryTime < endTime
          );
        });

        const totalCountForHour = hourOccupancy.reduce(
          (sum, entry) => sum + entry.Count,
          0
        );
        bookingOccupancy.push(totalCountForHour);
      }

      // Calculate the average occupancy count for the entire booking duration
      const avgOccupancy =
        bookingOccupancy.reduce((sum, count) => sum + count, 0) /
        bookingOccupancy.length;

      // Calculate whole booking utilization
      const wholeBookingUtilisation = (avgOccupancy / capacity) * 100 || 0;

      return {
        BookingReferenceNumber,
        StartTime: formatTime(BookingStartTime),
        EndTime: formatTime(BookingEndTime),
        FacilityName,
        hourlyUtilisation: hourlyUtilisation.toFixed(2),
        wholeBookingUtilisation: wholeBookingUtilisation.toFixed(2), 
      };
    });
  };

  const utilizationData = calculateUtilization(); 

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Average Booking Utilisation</h2>

      {/* Room Selection */}
      <div className="mb-4">
        <label className="mr-2">Select Room:</label>
        <select
          value={selectedRoom}
          onChange={(e) => {
            setSelectedRoom(e.target.value);
            calculateUtilization();
          }}
          className="border px-2 py-1"
        >
          {roomNames.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="mr-2">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            calculateUtilization();
          }}
          className="border px-2 py-1"
        />
      </div>

      {/* Hour Selection */}
      <div className="mb-4">
        <label className="mr-2">Select Hour:</label>
        <select
          value={selectedHour}
          onChange={(e) => {
            setSelectedHour(e.target.value);
            calculateUtilization();
          }}
          className="border px-2 py-1"
        >
          <option value="">All Hours</option>
          {hours.map((hour) => (
            <option key={hour} value={hour}>
              {hour}:00
            </option>
          ))}
        </select>
      </div>

      {/* Utilization Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Booking Ref No</th>
            <th className="border border-gray-300 px-4 py-2">Facility Name</th>
            <th className="border border-gray-300 px-4 py-2">Start Time</th>
            <th className="border border-gray-300 px-4 py-2">End Time</th>
            <th className="border border-gray-300 px-4 py-2">
              Hourly Avg Utilisation (%)
            </th>
            <th className="border border-gray-300 px-4 py-2">
              Whole Booking Avg Utilisation (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {utilizationData.length > 0 ? (
            utilizationData.map(
              ({
                BookingReferenceNumber,
                FacilityName,
                StartTime,
                EndTime,
                hourlyUtilisation,
                wholeBookingUtilisation,
              }) => (
                <tr
                  key={`${BookingReferenceNumber}-${StartTime}-${EndTime}`}
                  className="border border-gray-300"
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {BookingReferenceNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {FacilityName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {StartTime}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {EndTime}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {hourlyUtilisation}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {wholeBookingUtilisation}%
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                No confirmed bookings available for this room on the selected
                date.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AvgBookingUtilisation;
