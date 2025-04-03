import React from "react";

const AvgBookingUtilisation = ({
  bookings = [],
  occupancyData = [],
  roomName = "",
  timeRange = "day",
  selectedDate = "",
  selectedHour = "",
}) => {
  // Convert selectedDate to Date object
  const selectedDateObj = new Date(selectedDate);

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const isSameWeek = (date1, date2) => {
    const startOfWeek = new Date(date2);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)); // Adjust to Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return date1 >= startOfWeek && date1 <= endOfWeek;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateUtilization = () => {
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.BookingStartTime);
      if (booking.BookingStatus !== "Confirmed" || booking.FacilityName !== roomName) {
        return false;
      }
      if (timeRange === "hour") {
        return (
          isSameDay(bookingDate, selectedDateObj) &&
          new Date(booking.BookingStartTime).getHours() <= selectedHour &&
          new Date(booking.BookingEndTime).getHours() > selectedHour
        );
      }
      if (timeRange === "day") {
        return isSameDay(bookingDate, selectedDateObj);
      }
      if (timeRange === "week") {
        return isSameWeek(bookingDate, selectedDateObj);
      }
      return false;
    });

    return filteredBookings.map((booking) => {
      const { BookingReferenceNumber, BookingStartTime, BookingEndTime, FacilityName } = booking;
      const startTime = new Date(BookingStartTime);
      const endTime = new Date(BookingEndTime);

      // Get occupancy data for the entire booking duration
      const bookingOccupancy = occupancyData.filter((entry) => {
        const entryTime = new Date(entry.Time);
        return (
          entry.FacilityName === FacilityName &&
          entryTime >= startTime &&
          entryTime < endTime
        );
      });

      const totalCount = bookingOccupancy.reduce((sum, entry) => sum + entry.Count, 0);
      const capacity = bookingOccupancy.length > 0 ? bookingOccupancy[0].Capacity : 1;
      const avgOccupancy = bookingOccupancy.length > 0 ? totalCount / bookingOccupancy.length : 0;
      const wholeBookingUtilisation = (avgOccupancy / capacity) * 100 || 0;

      return {
        BookingReferenceNumber,
        StartTime: formatTime(BookingStartTime),
        EndTime: formatTime(BookingEndTime),
        FacilityName,
        wholeBookingUtilisation: wholeBookingUtilisation.toFixed(2),
      };
    });
  };

  const utilizationData = calculateUtilization();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Average Booking Utilisation</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Booking Ref No</th>
            <th className="border border-gray-300 px-4 py-2">Facility Name</th>
            <th className="border border-gray-300 px-4 py-2">Start Time</th>
            <th className="border border-gray-300 px-4 py-2">End Time</th>
            <th className="border border-gray-300 px-4 py-2">Whole Booking Avg Utilisation (%)</th>
          </tr>
        </thead>
        <tbody>
          {utilizationData.length > 0 ? (
            utilizationData.map(({
              BookingReferenceNumber,
              FacilityName,
              StartTime,
              EndTime,
              wholeBookingUtilisation,
            }) => (
              <tr key={`${BookingReferenceNumber}-${StartTime}-${EndTime}`} className="border border-gray-300">
                <td className="border border-gray-300 px-4 py-2">{BookingReferenceNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{FacilityName}</td>
                <td className="border border-gray-300 px-4 py-2">{StartTime}</td>
                <td className="border border-gray-300 px-4 py-2">{EndTime}</td>
                <td className="border border-gray-300 px-4 py-2">{wholeBookingUtilisation}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No confirmed bookings available for this room in the selected time range.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AvgBookingUtilisation;