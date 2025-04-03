import React from "react";

const BookedUtilizedChart = ({ 
  bookings = [], 
  occupancyData = [], 
  roomName = "",  
  timeRange = "day", 
  selectedDate = "", 
  selectedHour = ""
}) => {
  // Filter bookings for the selected room
  const roomBookings = bookings.filter(booking => 
    booking.FacilityName === roomName &&
    booking.BookingStatus === "Confirmed"
  );

  // Filter occupancy data for the selected room
  const roomOccupancy = occupancyData.filter(occ => 
    occ.FacilityName === roomName
  );

  // Calculate utilization based on time range
  const calculateUtilization = () => {
    if (timeRange === "hour") {
      return calculateHourlyUtilization();
    } else if (timeRange === "day") {
      return calculateDailyUtilization();
    } else if (timeRange === "week") {
      return calculateWeeklyUtilization();
    }
    return { bookedPercentage: 0, utilizedPercentage: 0 };
  };

  const calculateHourlyUtilization = () => {
    if (!selectedDate || !selectedHour) return { bookedPercentage: 0, utilizedPercentage: 0 };
    
    const targetHour = new Date(selectedDate);
    targetHour.setHours(selectedHour, 0, 0, 0);
    
    const nextHour = new Date(targetHour);
    nextHour.setHours(targetHour.getHours() + 1);
    
    // Check if the room is booked during this hour
    const isBooked = roomBookings.some(booking => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      return start <= targetHour && end >= nextHour;
    });
    
    // Find occupancy data for this hour
    const occupancy = roomOccupancy.find(occ => {
      const occTime = new Date(occ.Time);
      return occTime.getTime() === targetHour.getTime();
    });
    
    const capacity = occupancy?.Capacity || 0;
    const count = occupancy?.Count || 0;
    
    const bookedPercentage = isBooked ? 100 : 0;
    const utilizedPercentage = capacity > 0 ? Math.round((count / capacity) * 100) : 0;
    
    return { bookedPercentage, utilizedPercentage };
  };

  const calculateDailyUtilization = () => {
    if (!selectedDate) return { bookedPercentage: 0, utilizedPercentage: 0 };
    
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);
    
    // Filter bookings for this day
    const dailyBookings = roomBookings.filter(booking => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      return (start >= targetDate && start < nextDay) || 
             (end > targetDate && end <= nextDay) ||
             (start <= targetDate && end >= nextDay);
    });
    
    // Calculate booked hours
    let bookedHours = 0;
    dailyBookings.forEach(booking => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      
      // Adjust to day boundaries
      const bookingStart = start < targetDate ? targetDate : start;
      const bookingEnd = end > nextDay ? nextDay : end;
      
      bookedHours += (bookingEnd - bookingStart) / (1000 * 60 * 60);
    });
    
    // Filter occupancy data for this day
    const dailyOccupancy = roomOccupancy.filter(occ => {
      const occTime = new Date(occ.Time);
      return occTime >= targetDate && occTime < nextDay;
    });
    
    // Calculate average utilization
    let totalCapacity = 0;
    let totalCount = 0;
    
    dailyOccupancy.forEach(occ => {
      totalCapacity += occ.Capacity || 0;
      totalCount += occ.Count || 0;
    });
    
    const bookedPercentage = Math.round((bookedHours / 24) * 100);
    const utilizedPercentage = totalCapacity > 0 ? Math.round((totalCount / totalCapacity) * 100) : 0;
    
    return { bookedPercentage, utilizedPercentage };
  };

  const calculateWeeklyUtilization = () => {
    if (!selectedDate) return { bookedPercentage: 0, utilizedPercentage: 0 };
    
    const targetDate = new Date(selectedDate);
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    // Filter bookings for this week
    const weeklyBookings = roomBookings.filter(booking => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      return (start >= startOfWeek && start < endOfWeek) || 
             (end > startOfWeek && end <= endOfWeek) ||
             (start <= startOfWeek && end >= endOfWeek);
    });
    
    // Calculate booked hours
    let bookedHours = 0;
    weeklyBookings.forEach(booking => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      
      // Adjust to week boundaries
      const bookingStart = start < startOfWeek ? startOfWeek : start;
      const bookingEnd = end > endOfWeek ? endOfWeek : end;
      
      bookedHours += (bookingEnd - bookingStart) / (1000 * 60 * 60);
    });
    
    // Filter occupancy data for this week
    const weeklyOccupancy = roomOccupancy.filter(occ => {
      const occTime = new Date(occ.Time);
      return occTime >= startOfWeek && occTime < endOfWeek;
    });
    
    // Calculate average utilization
    let totalCapacity = 0;
    let totalCount = 0;
    
    weeklyOccupancy.forEach(occ => {
      totalCapacity += occ.Capacity || 0;
      totalCount += occ.Count || 0;
    });
    
    const bookedPercentage = Math.round((bookedHours / (24 * 7)) * 100);
    const utilizedPercentage = totalCapacity > 0 ? Math.round((totalCount / totalCapacity) * 100) : 0;
    
    return { bookedPercentage, utilizedPercentage };
  };

  const { bookedPercentage, utilizedPercentage } = calculateUtilization();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Booked & Utilized</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <h3 className="text-sm font-medium text-blue-800">Booked</h3>
          <p className="text-2xl font-bold text-blue-600">{bookedPercentage}%</p>
          <p className="text-xs text-gray-500">
            {timeRange === "hour" ? "This hour" : 
             timeRange === "day" ? "Today" : "This week"}
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <h3 className="text-sm font-medium text-green-800">Utilized</h3>
          <p className="text-2xl font-bold text-green-600">{utilizedPercentage}%</p>
          <p className="text-xs text-gray-500">
            {timeRange === "hour" ? "This hour" : 
             timeRange === "day" ? "Today" : "This week"}
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <span className="font-medium">Booked</span> shows the percentage of time the room is reserved.
        </p>
        <p className="mt-1">
          <span className="font-medium">Utilized</span> shows the actual usage percentage based on occupancy.
        </p>
      </div>
    </div>
  );
};

export default BookedUtilizedChart;