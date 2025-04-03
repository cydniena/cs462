import React from "react";
import PropTypes from "prop-types";
import "../css/text.css";

const RoomStats = ({
  bookings = [],
  occupancyData = [],
  roomName = "",
  timeRange = "",
  selectedDate = "",
  selectedHour = "",
}) => {
  // Operating hours configuration
  const OPERATING_HOURS = {
    start: 8, // 8AM
    end: 22, // 10PM
  };
  const HOURS_PER_DAY = OPERATING_HOURS.end - OPERATING_HOURS.start;
  const HOURS_PER_WEEK = HOURS_PER_DAY * 7;

  // Filter data based on selected time range and room
  const filteredData = occupancyData.filter((item) => {
    if (item.FacilityName !== roomName) return false;

    const itemDate = new Date(item.Time).toISOString().split("T")[0];
    const itemHour = new Date(item.Time).getHours();

    if (timeRange === "hour") {
      return itemDate === selectedDate && itemHour == selectedHour;
    } else if (timeRange === "day") {
      return (
        itemDate === selectedDate &&
        itemHour >= OPERATING_HOURS.start &&
        itemHour < OPERATING_HOURS.end
      );
    } else if (timeRange === "week") {
      const selectedWeek = getWeekNumber(new Date(selectedDate));
      const itemWeek = getWeekNumber(new Date(itemDate));
      return (
        selectedWeek === itemWeek &&
        new Date(itemDate).getFullYear() ===
          new Date(selectedDate).getFullYear() &&
        itemHour >= OPERATING_HOURS.start &&
        itemHour < OPERATING_HOURS.end
      );
    }
    return true;
  });

  // Filter bookings for the selected room and time range
  // Filter bookings for the selected room and time range
  const filteredBookings = bookings.filter((booking) => {
    if (booking.FacilityName !== roomName) return false;

    const bookingStart = new Date(booking.BookingStartTime);
    const bookingEnd = new Date(booking.BookingEndTime);
    const bookingStartHour = bookingStart.getHours();
    const bookingEndHour = bookingEnd.getHours();

    const bookingDate = bookingStart.toISOString().split("T")[0];
    const selectedDateFormatted = selectedDate; // Assuming selectedDate is already formatted to "YYYY-MM-DD"

    if (timeRange === "hour") {
      // For hourly view, check if the selected hour is within the range of the booking's start and end hours
      return (
        bookingDate === selectedDateFormatted &&
        parseInt(selectedHour) >= bookingStartHour &&
        parseInt(selectedHour) < bookingEndHour
      );
    } else if (timeRange === "day") {
      // For daily view, check if the booking occurs on the selected date
      return bookingDate === selectedDateFormatted;
    } else if (timeRange === "week") {
      // For weekly view, check if the booking falls within the selected week
      const selectedWeek = getWeekNumber(new Date(selectedDate));
      const bookingWeek = getWeekNumber(new Date(bookingDate));
      return (
        selectedWeek === bookingWeek &&
        new Date(bookingDate).getFullYear() ===
          new Date(selectedDate).getFullYear()
      );
    }
    return true;
  });

  // Helper function to get week number
  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  // Calculate utilization statistics
  const calculateUtilization = () => {
    if (filteredData.length === 0) {
      return { utilized: 0, total: 0 };
    }

    if (timeRange === "hour") {
      // For hourly view, we're only looking at one specific hour
      const isUtilized = filteredData.some((item) => item.Count > 0);
      return {
        utilized: isUtilized ? 1 : 0,
        total: 1,
      };
    } else if (timeRange === "day") {
      const hours = new Set();
      const utilizedHours = new Set();

      filteredData.forEach((item) => {
        const hour = new Date(item.Time).getHours();
        hours.add(hour);
        if (item.Count > 0) utilizedHours.add(hour);
      });

      return {
        utilized: utilizedHours.size,
        total: hours.size,
      };
    } else if (timeRange === "week") {
      const utilizedHours = filteredData.reduce((total, item) => {
        return item.Count > 0 ? total + 1 : total;
      }, 0);

      return {
        utilized: utilizedHours,
        total: HOURS_PER_WEEK,
      };
    }

    return { utilized: 0, total: 0 };
  };

  // Calculate booked hours
  const calculateBookedHours = () => {
    if (timeRange === "hour") {
      // For hourly view, check if there's any confirmed booking for that hour
      const isBooked = filteredBookings.some((booking) => {
        const bookingStart = new Date(booking.BookingStartTime);
        const bookingEnd = new Date(booking.BookingEndTime);

        const startHour = bookingStart.getHours();
        const endHour = bookingEnd.getHours();

        // Check if the selected hour is within the range of the booking's start and end hours
        return (
          booking.BookingStatus === "Confirmed" &&
          // Ensure the selected hour is within the booking's duration
          startHour <= parseInt(selectedHour) &&
          parseInt(selectedHour) < endHour
        );
      });

      return {
        booked: isBooked ? 1 : 0,
        total: 1,
      };
    } else if (timeRange === "day") {
      // For daily view, calculate total booked hours in the day
      const hourSet = new Set(); // To track unique hours with confirmed bookings

      filteredBookings.forEach((booking) => {
        if (booking.BookingStatus !== "Confirmed") return; // Skip non-confirmed bookings
        const start = new Date(booking.BookingStartTime);
        const end = new Date(booking.BookingEndTime);

        const startHour = start.getHours();
        const endHour = end.getHours();

        // Add all hours between the start and end hour to the hourSet
        for (let hour = startHour; hour < endHour; hour++) {
          if (hour >= OPERATING_HOURS.start && hour < OPERATING_HOURS.end) {
            hourSet.add(hour);
          }
        }
      });

      return {
        booked: hourSet.size,
        total: HOURS_PER_DAY,
      };
    } else if (timeRange === "week") {
      // For weekly view, calculate total booked hours in the week
      const hourSet = new Set(); // To track unique hour slots (day + hour)

      filteredBookings.forEach((booking) => {
        if (booking.BookingStatus !== "Confirmed") return; // Skip non-confirmed bookings
        const start = new Date(booking.BookingStartTime);
        const end = new Date(booking.BookingEndTime);

        const startHour = start.getHours();
        const endHour = end.getHours();

        // Add all hours between the start and end hour to the hourSet, creating unique time slots for each day and hour
        for (let hour = startHour; hour < endHour; hour++) {
          const time = new Date(
            start.getTime() + (hour - startHour) * 60 * 60 * 1000
          );
          const hourSlot = time.getHours();

          if (
            hourSlot >= OPERATING_HOURS.start &&
            hourSlot < OPERATING_HOURS.end
          ) {
            const dateStr = time.toISOString().split("T")[0];
            hourSet.add(`${dateStr}-${hourSlot}`);
          }
        }
      });

      return {
        booked: hourSet.size,
        total: HOURS_PER_WEEK,
      };
    }

    return { booked: 0, total: 0 };
  };

  // Generate visualization
  const renderVisualization = () => {
    const { utilized, total } = calculateUtilization();
    const { booked } = calculateBookedHours();

    return (
      <div className="grid grid-cols-2 gap-4 mt-5 text-lg">
        <div className="p-4 bg-white shadow-md rounded-lg border">
          <p className="font-semibold text-gray-700">Utilized Hours</p>
          <p className="text-xl font-bold text-blue-600">
            {utilized}hr/{total}hr
          </p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-lg border">
          <p className="font-semibold text-gray-700">Not Utilized Hours</p>
          <p className="text-xl font-bold text-red-600">
            {total - utilized}hr/{total}hr
          </p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-lg border">
          <p className="font-semibold text-gray-700">Booked Hours</p>
          <p className="text-xl font-bold text-green-600">
            {booked}hr/{total}hr
          </p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-lg border">
          <p className="font-semibold text-gray-700">Unbooked Hours</p>
          <p className="text-xl font-bold text-orange-600">
            {total - booked}hr/{total}hr
          </p>
        </div>
      </div>
    );
  };

  return <div>{renderVisualization()}</div>;
};

RoomStats.propTypes = {
  bookings: PropTypes.array,
  occupancyData: PropTypes.array,
  roomName: PropTypes.string,
};

export default RoomStats;
