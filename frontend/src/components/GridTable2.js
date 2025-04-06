import React, { useState, useEffect, useMemo } from "react";
import "../screens/css/summary.css";
import { startOfWeek, addDays, parseISO, format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const GridTable2 = ({ utilizationData, bookingsData, selectedRoom }) => {
  const [timeRange, setTimeRange] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedHour, setSelectedHour] = useState("8");
  const [processedData, setProcessedData] = useState({});

  // Ensure the array includes all 7 days, starting with Monday
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i); // 8 AM - 10 PM

  useEffect(() => {
    const result = processUtilizationData(
      utilizationData,
      bookingsData,
      selectedDate,
      selectedRoom
    );
    setProcessedData(result);
  }, [utilizationData, bookingsData, selectedDate, timeRange, selectedRoom]);

  const processUtilizationData = (
    rawData,
    bookingData,
    selectedDate,
    roomFilter
  ) => {
    // Ensure Monday as the start of the week (weekStartsOn: 1)
    const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
    const result = {};

    // Loop through all 7 days (0 to 6), representing Monday to Sunday
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayName = days[i]; // Correctly mapping day names
      if (!result[dayName]) result[dayName] = {};

      for (let hour = 8; hour <= 22; hour++) {
        result[dayName][hour] = { sum: 0, count: 0, booked: false };
      }
    }

    // Process the raw data and map it to the correct day and hour
    rawData.forEach((entry) => {
      if (roomFilter && entry.FacilityName !== roomFilter) return;

      const time = parseISO(entry.Time);
      const dayIndex = time.getDay(); // Get the day index (0 = Sunday, 6 = Saturday)
      const hour = time.getHours(); // Get the hour

      // Correctly adjust the dayIndex so it aligns with Monday (0) to Sunday (6)
      const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

      // Process only if the day is within the week and the hour is valid
      if (
        adjustedDayIndex >= 0 &&
        adjustedDayIndex <= 6 &&
        hour >= 8 &&
        hour <= 22
      ) {
        const entryDate = new Date(time);
        const start = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
        const end = addDays(start, 6);
        if (entryDate >= start && entryDate < end) {
          const dayName = days[adjustedDayIndex]; // Map to Monday-Sunday correctly
          const utilization = (entry.Count / entry.Capacity) * 100;
          result[dayName][hour].sum += utilization;
          result[dayName][hour].count += 1;
        }
      }
    });

    // Mark booked times based on bookingsData
    bookingData.forEach((booking) => {
      if (roomFilter && booking.FacilityName !== roomFilter) return;
      if (booking.BookingStatus !== "Confirmed") return;

      const bookingStart = parseISO(booking.BookingStartTime);
      const bookingEnd = parseISO(booking.BookingEndTime);

      // Check for overlaps with each hour in the grid
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dayName = days[i];

        for (let hour = 8; hour <= 22; hour++) {
          const hourStart = new Date(day.setHours(hour, 0, 0, 0));
          const hourEnd = new Date(hourStart);
          hourEnd.setHours(hourStart.getHours() + 1); // 1 hour duration

          if (hourStart >= bookingStart && hourEnd <= bookingEnd) {
            result[dayName][hour].booked = true;
          }
        }
      }
    });

    // Finalize data with average utilization
    const finalData = {};
    Object.entries(result).forEach(([day, hoursObj]) => {
      finalData[day] = {};
      Object.entries(hoursObj).forEach(([hour, { sum, count, booked }]) => {
        const avg = count > 0 ? Math.round(sum / count) : 0;
        finalData[day][hour] = { utilization: avg, booked };
      });
    });

    return finalData;
  };

  const getCellColor = (utilization) => {
    if (utilization >= 80) return "high-utilization";
    if (utilization >= 60) return "medium-utilization";
    return "low-utilization";
  };

  // Code for current occupation
  const today = useMemo(() => new Date().toISOString().split("T")[0], []); // Cached today's date for re-use

  // Function to format date to a user-friendly format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });
  };

  // Function to calculate the room's occupancy data for today
  const getRoomUtilizationData = () => {
    const roomUtilization = utilizationData
      .filter((entry) => entry.FacilityName === selectedRoom)
      .sort((a, b) => new Date(b.Time) - new Date(a.Time)); // Sort by latest

    // Find today's data if it exists, else fallback to the latest available data
    const todayData = roomUtilization.find((entry) =>
      entry.Time.startsWith(today)
    );
    return todayData || roomUtilization[0];
  };

  const latestData = useMemo(getRoomUtilizationData, [
    utilizationData,
    selectedRoom,
    today,
  ]);

  //Code for Booked & Utilized
  // Filter bookings for the selected room
  const roomBookings = bookingsData.filter(
    (booking) =>
      booking.FacilityName === selectedRoom &&
      booking.BookingStatus === "Confirmed"
  );

  // Filter occupancy data for the selected room
  const roomOccupancy = utilizationData.filter(
    (occ) => occ.FacilityName === selectedRoom
  );

  // Calculate booked & utilized percentage
  const calculateBookedUtilized = () => {
    if (!selectedDate) return 0;

    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);

    let startTime, endTime;
    if (timeRange === "hour" && selectedHour) {
      startTime = new Date(targetDate);
      startTime.setHours(selectedHour, 0, 0, 0);
      endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
    } else if (timeRange === "week") {
      startTime = new Date(targetDate);
      startTime.setDate(targetDate.getDate() - targetDate.getDay());
      startTime.setHours(0, 0, 0, 0);
      endTime = new Date(startTime);
      endTime.setDate(startTime.getDate() + 7);
    } else {
      // Default to "day"
      startTime = new Date(targetDate);
      endTime = new Date(targetDate);
      endTime.setDate(targetDate.getDate() + 1);
    }

    // Filter bookings within the time range
    const bookedRooms = roomBookings.filter((booking) => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      return (
        (start >= startTime && start < endTime) ||
        (end > startTime && end <= endTime) ||
        (start <= startTime && end >= endTime)
      );
    });

    // Filter occupancy data within the time range
    const utilizedRooms = roomOccupancy.filter((occ) => {
      const occTime = new Date(occ.Time);
      return occTime >= startTime && occTime < endTime && occ.Count > 0;
    });

    // Calculate how many of the booked rooms were actually utilized
    const utilizedBookings = bookedRooms.filter((booking) => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      // Check if the booking falls within any utilized occupancy data
      return utilizedRooms.some((occ) => {
        const occTime = new Date(occ.Time);
        return occTime >= start && occTime < end;
      });
    });

    const totalBooked = bookedRooms.length;
    const totalUtilized = utilizedBookings.length;

    // Return the percentage of booked rooms that were utilized
    return totalBooked > 0
      ? Math.round((totalUtilized / totalBooked) * 100)
      : 0;
  };

  const bookedUtilizedPercentage = calculateBookedUtilized();

  // Average Booking Utilization

  // Convert selectedDate to Date object
  const [showModal, setShowModal] = useState(false);

  const selectedDateObj = new Date(selectedDate);

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const isSameWeek = (date1, date2) => {
    const startOfWeek = new Date(date2);
    startOfWeek.setDate(
      startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return date1 >= startOfWeek && date1 <= endOfWeek;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatPerBookingDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateUtilization = () => {
    const filteredBookings = bookingsData.filter((booking) => {
      const bookingDate = new Date(booking.BookingStartTime);
      if (
        booking.BookingStatus !== "Confirmed" ||
        booking.FacilityName !== selectedRoom
      )
        return false;

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
      const {
        BookingReferenceNumber,
        BookingStartTime,
        BookingEndTime,
        FacilityName,
      } = booking;
      const startTime = new Date(BookingStartTime);
      const endTime = new Date(BookingEndTime);

      const bookingOccupancy = utilizationData.filter((entry) => {
        const entryTime = new Date(entry.Time);
        return (
          entry.FacilityName === FacilityName &&
          entryTime >= startTime &&
          entryTime < endTime
        );
      });

      const totalCount = bookingOccupancy.reduce(
        (sum, entry) => sum + entry.Count,
        0
      );
      const capacity =
        bookingOccupancy.length > 0 ? bookingOccupancy[0].Capacity : 1;
      const avgOccupancy =
        bookingOccupancy.length > 0 ? totalCount / bookingOccupancy.length : 0;
      const wholeBookingUtilisation = (avgOccupancy / capacity) * 100 || 0;

      return {
        BookingReferenceNumber,
        StartTime: formatTime(BookingStartTime),
        EndTime: formatTime(BookingEndTime),
        FacilityName,
        wholeBookingUtilisation: wholeBookingUtilisation.toFixed(2),
        BookingDate: formatPerBookingDate(BookingStartTime),
      };
    });
  };

  const utilizationPerBookingData = calculateUtilization();

  // Group by BookingDate (keep the original grouping)
  const groupedByDate = utilizationPerBookingData.reduce((acc, booking) => {
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

  // Chart Data
  const [processedChartData, setProcessedChartData] = useState({});

  useEffect(() => {
    if (!utilizationData || !Array.isArray(utilizationData)) return;

    const selected = parseISO(selectedDate);

    const weekStart = startOfWeek(selected, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);

    // Filter for hourly chart
    const filteredHourlyData = utilizationData.filter((entry) => {
      const entryDate = parseISO(entry.Time);
      const sameRoom = entry.FacilityName === selectedRoom;

      if (timeRange === "hour") {
        return (
          sameRoom &&
          format(entryDate, "yyyy-MM-dd") === format(selected, "yyyy-MM-dd") &&
          entryDate.getHours() === parseInt(selectedHour)
        );
      } else if (timeRange === "day") {
        return (
          sameRoom &&
          format(entryDate, "yyyy-MM-dd") === format(selected, "yyyy-MM-dd")
        );
      } else if (timeRange === "week") {
        return sameRoom && entryDate >= weekStart && entryDate <= weekEnd;
      }

      return false;
    });

    // Filter for daily chart (always full week)
    const filteredDailyData = utilizationData.filter((entry) => {
      const entryDate = parseISO(entry.Time);
      return (
        entry.FacilityName === selectedRoom &&
        entryDate >= weekStart &&
        entryDate <= weekEnd
      );
    });

    // Process Hourly Data
    const hourly = [];

    if (timeRange === "week") {
      const hourMap = {}; // {hour: { total: x, count: y }}

      filteredHourlyData.forEach((entry) => {
        const entryDate = parseISO(entry.Time);
        const hour = entryDate.getHours();
        const utilization =
          entry.Capacity === 0 ? 0 : (entry.Count / entry.Capacity) * 100;

        if (!hourMap[hour]) {
          hourMap[hour] = { total: 0, count: 0 };
        }

        hourMap[hour].total += utilization;
        hourMap[hour].count += 1;
      });

      for (let h = 8; h <= 22; h++) {
        const hourStats = hourMap[h] || { total: 0, count: 0 };
        hourly.push({
          hour: h,
          utilization:
            hourStats.count === 0
              ? 0
              : Math.round(hourStats.total / hourStats.count),
        });
      }
    } else {
      filteredHourlyData.forEach((entry) => {
        const entryDate = parseISO(entry.Time);
        const hour = entryDate.getHours();
        const utilization =
          entry.Capacity === 0 ? 0 : (entry.Count / entry.Capacity) * 100;

        hourly.push({ hour, utilization: Math.round(utilization) });
      });
    }

    // Process Daily Data
    const dailyMap = {};
    filteredDailyData.forEach((entry) => {
      const dateKey = format(parseISO(entry.Time), "yyyy-MM-dd");
      const utilization =
        entry.Capacity === 0 ? 0 : (entry.Count / entry.Capacity) * 100;

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { total: 0, count: 0 };
      }
      dailyMap[dateKey].total += utilization;
      dailyMap[dateKey].count += 1;
    });

    const daily = Object.entries(dailyMap).map(
      ([dateStr, { total, count }]) => ({
        day: format(parseISO(dateStr), "EEE"),
        utilization: Math.round(total / count),
      })
    );

    setProcessedChartData({ hourly, daily });
  }, [utilizationData, selectedDate, selectedHour, timeRange, selectedRoom]);

  const hourlyData = processedChartData.hourly || [];
  const dailyData = processedChartData.daily || [];

  // Room Statistics

  const OPERATING_HOURS = {
    start: 8, // 8AM
    end: 22, // 10PM
  };
  const HOURS_PER_DAY = OPERATING_HOURS.end - OPERATING_HOURS.start;
  const HOURS_PER_WEEK = HOURS_PER_DAY * 7;

  // Filter data based on selected time range and room
  const filteredData = utilizationData.filter((item) => {
    if (item.FacilityName !== selectedRoom) return false;

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
  const filteredBookings = bookingsData.filter((booking) => {
    if (booking.FacilityName !== selectedRoom) return false;

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
  const calculateUtilizationStatistics = () => {
    if (filteredData.length === 0) {
      return { utilized: 0, totalHours: 0 };
    }

    if (timeRange === "hour") {
      // For hourly view, we're only looking at one specific hour
      const isUtilized = filteredData.some((item) => item.Count > 0);
      return {
        utilized: isUtilized ? 1 : 0,
        totalHours: 1,
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
        totalHours: hours.size,
      };
    } else if (timeRange === "week") {
      const utilizedHours = filteredData.reduce((total, item) => {
        return item.Count > 0 ? total + 1 : total;
      }, 0);

      return {
        utilized: utilizedHours,
        totalHours: HOURS_PER_WEEK,
      };
    }

    return { utilized: 0, totalHours: 0 };
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
        totalHours: 1,
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
        totalHours: HOURS_PER_DAY,
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
        totalHours: HOURS_PER_WEEK,
      };
    }

    return { booked: 0, totalHours: 0 };
  };

  const { utilized, totalHours } = calculateUtilizationStatistics();
  const { booked } = calculateBookedHours();

  return (
    <div className="utilization-container">
      <h1>{selectedRoom} Utilization Summary</h1>

      <h3 className="text-lg font-bold text-gray-800 mb-4">Time Filters</h3>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
          flexDirection: "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label htmlFor="timeRange">Time Filter:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: "5px" }}
          >
            <option value="hour">By Hour</option>
            <option value="day">By Day</option>
            <option value="week">By Week</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label htmlFor="datePicker">Date:</label>
          <input
            type="date"
            id="datePicker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: "5px" }}
          />
        </div>

        {timeRange === "hour" && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label htmlFor="hourPicker">Hour:</label>
            <select
              id="hourPicker"
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              style={{ padding: "5px" }}
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}:00
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div
        className="summary-panel"
        style={{ display: "flex", flexDirection: "row", gap: "20px" }}
      >
        <div className="summary-card">
          <h3>Latest Occupancy</h3>
          <div className="summary-item">
            <span className="summary-label">Occupancy:</span>
            <span className="summary-value">
              {latestData.Count} / {latestData.Capacity}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Date:</span>
            <span className="summary-value">{formatDate(latestData.Time)}</span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Booked & Utilized</h3>
          <div className="summary-item">
            <span className="summary-value">{bookedUtilizedPercentage}%</span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Utilized Hours</h3>
          <div className="summary-item">
            <span className="summary-value">
              {utilized}hr/{totalHours}hr
            </span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Unutilized Hours</h3>
          <div className="summary-item">
            <span className="summary-value">
              {totalHours - utilized}hr/{totalHours}hr
            </span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Booked Hours</h3>
          <div className="summary-item">
            <span className="summary-value">
              {booked}hr/{totalHours}hr
            </span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Unbooked Hours</h3>
          <div className="summary-item">
            <span className="summary-value">
              {totalHours - booked}hr/{totalHours}hr
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="table-container">
          <div className="utilization-grid">
            <div className="grid-row header">
              <div className="grid-cell time-label">Time/Day</div>
              {hours.map((hour) => (
                <div key={hour} className="grid-cell hour-header">
                  {hour}:00
                </div>
              ))}
            </div>

            {days.map((day) => (
              <div key={day} className="grid-row">
                <div className="grid-cell day-label">{day}</div>
                {hours.map((hour) => {
                  const data = processedData[day]?.[hour] || {
                    utilization: 0,
                    booked: false,
                  };
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`grid-cell ${getCellColor(data.utilization)}`}
                      title={`${day} ${hour}:00 - Utilization: ${data.utilization}%`}
                    >
                      {data.booked ? "B" : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-color low-utilization"></div>
              <span>Low Utilization (0-59%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color medium-utilization"></div>
              <span>Medium Utilization (60-79%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color high-utilization"></div>
              <span>High Utilization (80-100%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color">B</div>
              <span>Booked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly and Daily Utilization Overview Charts - Side by Side */}
      <div
        className="charts-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "40px",
        }}
      >
        {/* Hourly Utilization Overview Chart */}
        <div className="chart-box" style={{ width: "40%" }}>
          <h2>Hourly Utilization Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="utilization" fill="#4CAF50" />
              <ReferenceLine
                y={70}
                label={{ value: "Expected (70%)", position: "top" }}
                stroke="black"
                strokeDasharray="3 3"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Average Utilization Overview Chart */}
        <div className="chart-box" style={{ width: "40%" }}>
          <h2>Daily Average Utilization Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="utilization" fill="#2196F3" />
              <ReferenceLine
                y={70}
                label={{ value: "Expected (70%)", position: "top" }}
                stroke="black"
                strokeDasharray="3 3"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Average Booking Utilisation</h2>
          {Object.keys(groupedByDate).length > 0 && !showModal && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              View Details
            </button>
          )}
        </div>

        {!showModal && (
          <div>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">
                    Booking Ref No
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Start Time
                  </th>
                  <th className="border border-gray-300 px-4 py-2">End Time</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Whole Booking Avg Utilisation (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(displayData).length > 0 ? (
                  Object.entries(displayData).map(([date, bookings]) => (
                    <React.Fragment key={date}>
                      <tr className="bg-blue-100">
                        <td
                          colSpan="5"
                          className="text-left font-semibold px-4 py-2"
                        >
                          {date}
                        </td>
                      </tr>
                      {bookings.map(
                        ({
                          BookingReferenceNumber,
                          FacilityName,
                          StartTime,
                          EndTime,
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
                              {StartTime}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {EndTime}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {wholeBookingUtilisation}%
                            </td>
                          </tr>
                        )
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No confirmed bookings available for this room in the
                      selected time range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for full data */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
            <div className="rounded-lg shadow-lg w-11/12 max-w-5xl p-6 relative overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xl text-gray-600 hover:text-gray-900 justify-end"
                >
                  &times;
                </button>
              </div>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">
                      Booking Ref No
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Start Time
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      End Time
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Whole Booking Avg Utilisation (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedByDate).map(([date, bookings]) => (
                    <React.Fragment key={date}>
                      <tr className="bg-blue-100">
                        <td
                          colSpan="5"
                          className="text-left font-semibold px-4 py-2"
                        >
                          {date}
                        </td>
                      </tr>
                      {bookings.map(
                        ({
                          BookingReferenceNumber,
                          FacilityName,
                          StartTime,
                          EndTime,
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
                              {StartTime}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {EndTime}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {wholeBookingUtilisation}%
                            </td>
                          </tr>
                        )
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GridTable2;
