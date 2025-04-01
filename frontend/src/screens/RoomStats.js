import React from "react";
import PropTypes from "prop-types";

const StatCard = ({ title, value, description, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-900 border-blue-300",
    green: "bg-green-100 text-green-900 border-green-300",
    gray: "bg-gray-100 text-gray-900 border-gray-300",
    purple: "bg-purple-100 text-purple-900 border-purple-300",
  };

  return (
    <div
      className={`p-6 rounded-2xl border shadow-lg transition-all transform hover:scale-105 hover:shadow-xl ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-lg font-semibold uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <p className="text-4xl font-bold my-2">{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  description: PropTypes.string,
  color: PropTypes.oneOf(["blue", "green", "gray", "purple"]),
};

const RoomStats = ({ bookings = [], hourlyData = [], roomName = "" }) => {
  const DAILY_HOURS = 14;
  const WEEKLY_HOURS = DAILY_HOURS * 7;

  const hourlyStatsByWeek = hourlyData
    .filter((record) => record?.FacilityName === roomName)
    .reduce((weeks, record) => {
      try {
        const date = new Date(record?.Time);
        const weekKey = `${date.getFullYear()}-W${Math.ceil(
          ((date - new Date(date.getFullYear(), 0, 1)) / 86400000 + 1) / 7
        )
          .toString()
          .padStart(2, "0")}`;

        if (!weeks[weekKey]) {
          weeks[weekKey] = { utilized: 0, totalHours: 0 };
        }

        const hour = date.getHours();
        if (hour >= 8 && hour < 22) {
          weeks[weekKey].totalHours++;
          if (record?.Count > 0) weeks[weekKey].utilized++;
        }
      } catch (e) {
        console.warn("Invalid hourly record:", record);
      }
      return weeks;
    }, {});

  const bookingStatsByWeek = bookings
    .filter(
      (b) => b?.FacilityName === roomName && b?.BookingStatus === "Confirmed"
    )
    .reduce((weeks, booking) => {
      try {
        const date = new Date(booking.BookingStartTime);
        const weekKey = `${date.getFullYear()}-W${Math.ceil(
          ((date - new Date(date.getFullYear(), 0, 1)) / 86400000 + 1) / 7
        )
          .toString()
          .padStart(2, "0")}`;

        if (!weeks[weekKey]) {
          weeks[weekKey] = { bookedHours: 0 };
        }

        const start = new Date(booking.BookingStartTime);
        const end = new Date(booking.BookingEndTime);
        weeks[weekKey].bookedHours += (end - start) / (1000 * 60 * 60);
      } catch (e) {
        console.warn("Invalid booking record:", booking);
      }
      return weeks;
    }, {});

  const allWeekKeys = [
    ...new Set([
      ...Object.keys(hourlyStatsByWeek),
      ...Object.keys(bookingStatsByWeek),
    ]),
  ];

  const weeklyAverages = allWeekKeys.map((weekKey) => {
    const hourly = hourlyStatsByWeek[weekKey] || { utilized: 0, totalHours: 0 };
    const booking = bookingStatsByWeek[weekKey] || { bookedHours: 0 };

    return {
      weekKey,
      hourlyUtilized: hourly.utilized,
      hourlyNonUtilized: hourly.totalHours - hourly.utilized,
      bookedHours: booking.bookedHours,
      unbookedHours: WEEKLY_HOURS - booking.bookedHours,
    };
  });

  const totalWeeks = weeklyAverages.length;
  const totalHourlyUtilized = weeklyAverages.reduce(
    (sum, week) => sum + week.hourlyUtilized,
    0
  );
  const avgWeeklyHourlyUtilized = totalHourlyUtilized / totalWeeks;
  const avgDailyHourlyUtilized = totalHourlyUtilized / (totalWeeks * 7);
  const totalBookedHours = weeklyAverages.reduce(
    (sum, week) => sum + week.bookedHours,
    0
  );
  const avgWeeklyBooked = totalBookedHours / totalWeeks;
  const avgDailyBooked = totalBookedHours / (totalWeeks * 7);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Room Utilization</h2>
      <h3 className="text-xl font-semibold mb-4">{roomName} Utilization</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Avg Daily Usage"
          value={`${avgDailyHourlyUtilized.toFixed(1)}h`}
          color="green"
        />
        <StatCard
          title="Avg Weekly Usage"
          value={`${avgWeeklyHourlyUtilized.toFixed(1)}h`}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Avg Daily Booked"
          value={`${avgDailyBooked.toFixed(1)}h`}
          color="blue"
        />
        <StatCard
          title="Avg Weekly Booked"
          value={`${avgWeeklyBooked.toFixed(1)}h`}
          color="blue"
        />
      </div>
    </div>
  );
};

RoomStats.propTypes = {
  bookings: PropTypes.array,
  hourlyData: PropTypes.array,
  roomName: PropTypes.string,
};

export default RoomStats;
