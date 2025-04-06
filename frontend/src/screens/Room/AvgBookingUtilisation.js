import React, { useState } from "react";

const AvgBookingUtilisation = ({
  bookings = [],
  occupancyData = [],
  roomName = "",
  timeRange = "day",
  selectedDate = "",
  selectedHour = "",
}) => {
  const [showModal, setShowModal] = useState(false);

  const selectedDateObj = new Date(selectedDate);

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const isSameWeek = (date1, date2) => {
    const startOfWeek = new Date(date2);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return date1 >= startOfWeek && date1 <= endOfWeek;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateUtilization = () => {
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.BookingStartTime);
      if (booking.BookingStatus !== "Confirmed" || booking.FacilityName !== roomName) return false;

      if (timeRange === "hour") {
        return (
          isSameDay(bookingDate, selectedDateObj) &&
          new Date(booking.BookingStartTime).getHours() <= selectedHour &&
          new Date(booking.BookingEndTime).getHours() > selectedHour
        );
      }
      if (timeRange === "day") return isSameDay(bookingDate, selectedDateObj);
      if (timeRange === "week") return isSameWeek(bookingDate, selectedDateObj);
      return false;
    });

    return filteredBookings.map((booking) => {
      const { BookingReferenceNumber, BookingStartTime, BookingEndTime, FacilityName } = booking;
      const startTime = new Date(BookingStartTime);
      const endTime = new Date(BookingEndTime);

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
        BookingDate: formatDate(BookingStartTime),
      };
    });
  };

  const utilizationData = calculateUtilization();

  // Group by BookingDate (keep the original grouping)
  const groupedByDate = utilizationData.reduce((acc, booking) => {
    const date = booking.BookingDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  // Get the top 5 grouped bookings (as per your original logic)
  const getTop5Grouped = () => {
    let count = 0;
    const result = {};

    for (const date of Object.keys(groupedByDate)) {
      for (const booking of groupedByDate[date]) {
        if (count >= 5) return result;
        if (!result[date]) result[date] = [];
        result[date].push(booking);
        count++;
      }
    }
    return result;
  };

  const displayData = getTop5Grouped();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Average Booking Utilisation</h2>
        {Object.keys(groupedByDate).length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            View Details
          </button>
        )}
      </div>

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
          {Object.keys(displayData).length > 0 ? (
            Object.entries(displayData).map(([date, bookings]) => (
              <React.Fragment key={date}>
                <tr className="bg-blue-100">
                  <td colSpan="5" className="text-left font-semibold px-4 py-2">{date}</td>
                </tr>
                {bookings.map(({ BookingReferenceNumber, FacilityName, StartTime, EndTime, wholeBookingUtilisation }) => (
                  <tr key={`${BookingReferenceNumber}-${StartTime}-${EndTime}`} className="border border-gray-300">
                    <td className="border border-gray-300 px-4 py-2">{BookingReferenceNumber}</td>
                    <td className="border border-gray-300 px-4 py-2">{FacilityName}</td>
                    <td className="border border-gray-300 px-4 py-2">{StartTime}</td>
                    <td className="border border-gray-300 px-4 py-2">{EndTime}</td>
                    <td className="border border-gray-300 px-4 py-2">{wholeBookingUtilisation}%</td>
                  </tr>
                ))}
              </React.Fragment>
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

      {/* Modal for full data */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-5xl p-6 relative overflow-y-auto max-h-[80vh]">
            <h3 className="text-xl font-semibold mb-4">All Booking Utilisation</h3>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 text-xl text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
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
                {Object.entries(groupedByDate).map(([date, bookings]) => (
                  <React.Fragment key={date}>
                    <tr className="bg-blue-100">
                      <td colSpan="5" className="text-left font-semibold px-4 py-2">{date}</td>
                    </tr>
                    {bookings.map(({ BookingReferenceNumber, FacilityName, StartTime, EndTime, wholeBookingUtilisation }) => (
                      <tr key={`${BookingReferenceNumber}-${StartTime}-${EndTime}`} className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{BookingReferenceNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{FacilityName}</td>
                        <td className="border border-gray-300 px-4 py-2">{StartTime}</td>
                        <td className="border border-gray-300 px-4 py-2">{EndTime}</td>
                        <td className="border border-gray-300 px-4 py-2">{wholeBookingUtilisation}%</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvgBookingUtilisation;
