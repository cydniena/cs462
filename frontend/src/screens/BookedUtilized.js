import React, { useState, useMemo } from "react";
import {
  format,
  isSameDay,
  isSameWeek,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isWithinInterval,
} from "date-fns";

const BookedUtilizedChart = ({ bookings, occupancyData, roomName }) => {
  const [filterType, setFilterType] = useState("day");
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-17"));

  // Get all unique days with bookings
  const allDaysWithData = useMemo(() => {
    const days = [];
    const seenDays = new Set();

    bookings.forEach((booking) => {
      if (
        booking.BookingStatus === "Confirmed" &&
        booking.FacilityName === roomName
      ) {
        const bookingDate = startOfDay(parseISO(booking.BookingStartTime));
        const dayKey = bookingDate.getTime();

        if (!seenDays.has(dayKey)) {
          seenDays.add(dayKey);
          days.push(bookingDate);
        }
      }
    });

    return days.sort((a, b) => a - b);
  }, [bookings, roomName]);

  // Get all unique weeks with bookings
  const allWeeksWithData = useMemo(() => {
    const weeks = [];
    const seenWeeks = new Set();

    allDaysWithData.forEach((day) => {
      const weekStart = startOfWeek(day);
      const weekKey = weekStart.getTime();

      if (!seenWeeks.has(weekKey)) {
        seenWeeks.add(weekKey);
        weeks.push(weekStart);
      }
    });

    return weeks.sort((a, b) => a - b);
  }, [allDaysWithData]);

  // Calculate percentage for a specific day
  const calculateDailyPercentage = (date) => {
    let bookedRooms = 0;
    let bookedAndUtilizedRooms = 0;

    bookings.forEach((booking) => {
      const bookingStart = parseISO(booking.BookingStartTime);
      const bookingEnd = parseISO(booking.BookingEndTime);

      if (
        booking.BookingStatus === "Confirmed" &&
        booking.FacilityName === roomName &&
        isSameDay(bookingStart, date)
      ) {
        bookedRooms++;

        const hasUtilized = occupancyData.some((occupancy) => {
          const occupancyTime = parseISO(occupancy.Time);
          return (
            occupancy.FacilityName === roomName &&
            occupancyTime >= bookingStart &&
            occupancyTime < bookingEnd &&
            occupancy.Count > 0
          );
        });

        if (hasUtilized) {
          bookedAndUtilizedRooms++;
        }
      }
    });

    return bookedRooms > 0
      ? (bookedAndUtilizedRooms / bookedRooms) * 100
      : null;
  };

  // Calculate percentage for a specific week
  const calculateWeeklyPercentage = (weekStartDate) => {
    let totalBookedHours = 0;
    let totalUtilizedHours = 0;

    bookings.forEach((booking) => {
      const bookingStart = parseISO(booking.BookingStartTime);
      const bookingEnd = parseISO(booking.BookingEndTime);

      if (
        booking.BookingStatus === "Confirmed" &&
        booking.FacilityName === roomName &&
        isSameWeek(bookingStart, weekStartDate)
      ) {
        const bookingDuration = (bookingEnd - bookingStart) / (1000 * 60 * 60); // Convert ms to hours
        totalBookedHours += bookingDuration;

        const utilizedHours = occupancyData.reduce((sum, occupancy) => {
          const occupancyTime = parseISO(occupancy.Time);
          return occupancy.FacilityName === roomName &&
            occupancyTime >= bookingStart &&
            occupancyTime < bookingEnd &&
            occupancy.Count > 0
            ? sum + 1 / 60
            : sum; // Assume occupancy is recorded every minute
        }, 0);

        totalUtilizedHours += utilizedHours;
      }
    });

    return totalBookedHours > 0
      ? (totalUtilizedHours / totalBookedHours) * 100
      : null;
  };

  // Calculate overall daily average across all days with data
  const overallDailyAverage = useMemo(() => {
    const percentages = allDaysWithData
      .map((day) => calculateDailyPercentage(day))
      .filter((p) => p !== null);

    return percentages.length > 0
      ? percentages.reduce((a, b) => a + b, 0) / percentages.length
      : null;
  }, [allDaysWithData, bookings, occupancyData, roomName]);

  // Calculate overall weekly average across all weeks with data
  const overallWeeklyAverage = useMemo(() => {
    let totalUtilizedPercentage = 0;
    let totalWeeks = allWeeksWithData.length;

    allWeeksWithData.forEach((week) => {
      eachDayOfInterval({
        start: startOfWeek(week),
        end: endOfWeek(week),
      }).forEach((day) => {
        const dailyPercentage = calculateDailyPercentage(day);
        if (dailyPercentage !== null) {
          totalUtilizedPercentage += dailyPercentage;
        }
      });
    });

    return totalWeeks > 0 ? totalUtilizedPercentage / totalWeeks : null;
  }, [allWeeksWithData, bookings, occupancyData, roomName]);

  // Current day/week percentage
  const currentPercentage =
    filterType === "day"
      ? calculateDailyPercentage(selectedDate)
      : calculateWeeklyPercentage(selectedDate);

  return (
    <div className="p-4 space-y-4">
      {/* Filter Controls */}
      <div className="flex space-x-4" style={{display: "none"}}>
        <select
          onChange={(e) => setFilterType(e.target.value)}
          value={filterType}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
        </select>
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>

      {/* Current Percentage Card */}
      <div className="bg-gray-200 p-6 rounded-lg shadow-md" style={{display: "none"}}>
        <div className="text-center text-xl font-bold">
          {filterType === "day" ? "Daily" : "Weekly"} % Booked & Utilized:
          {currentPercentage !== null
            ? currentPercentage.toFixed(2)
            : "No data"}
          %
        </div>
      </div>

      {/* Averages Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Overall Averages</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Average Card */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <div className="text-center font-bold">
              Daily Average (All Data)
            </div>
            <div className="text-center text-xl">
              {overallDailyAverage !== null
                ? overallDailyAverage.toFixed(2)
                : "No data"}
              %
            </div>
            <div className="text-center text-sm text-gray-600" style={{display: "none"}}>
              Calculated from {allDaysWithData.length} days with bookings
            </div>
          </div>

          <p></p>

          {/* Weekly Average Card */}
          <div className="bg-green-100 p-4 rounded-lg shadow-md">
            <div className="text-center font-bold">
              Weekly Average (All Data)
            </div>
            <div className="text-center text-xl">
              {overallWeeklyAverage !== null
                ? overallWeeklyAverage.toFixed(2)
                : "No data"}
              %
            </div>
            <div className="text-center text-sm text-gray-600" style={{display: "none"}}>
              Calculated from {allWeeksWithData.length} weeks with bookings
            </div>
          </div>
        </div>
      </div>

      {/* Current Week Daily Averages (when in week view) */}
      {filterType === "week" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            Daily Averages for Selected Week
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
            {eachDayOfInterval({
              start: startOfWeek(selectedDate),
              end: endOfWeek(selectedDate),
            }).map((day) => {
              const percentage = calculateDailyPercentage(day);
              const hasData = allDaysWithData.some((d) => isSameDay(d, day));

              return (
                <div
                  key={day.toString()}
                  className={`p-3 rounded-lg shadow-md ${
                    hasData ? "bg-purple-100" : "bg-gray-100 opacity-50"
                  }`}
                >
                  <div className="text-center font-medium">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-center">
                    {hasData
                      ? percentage !== null
                        ? `${percentage.toFixed(2)}%`
                        : "No bookings"
                      : "No data"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookedUtilizedChart;
