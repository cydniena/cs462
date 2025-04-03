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
    } else { // Default to "day"
      startTime = new Date(targetDate);
      endTime = new Date(targetDate);
      endTime.setDate(targetDate.getDate() + 1);
    }
    
    // Filter bookings within the time range
    const bookedRooms = roomBookings.filter(booking => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      return (start >= startTime && start < endTime) || 
             (end > startTime && end <= endTime) ||
             (start <= startTime && end >= endTime);
    });
    
    // Filter occupancy data within the time range
    const utilizedRooms = roomOccupancy.filter(occ => {
      const occTime = new Date(occ.Time);
      return occTime >= startTime && occTime < endTime && occ.Count > 0;
    });
    
    // Calculate how many of the booked rooms were actually utilized
    const utilizedBookings = bookedRooms.filter(booking => {
      const start = new Date(booking.BookingStartTime);
      const end = new Date(booking.BookingEndTime);
      // Check if the booking falls within any utilized occupancy data
      return utilizedRooms.some(occ => {
        const occTime = new Date(occ.Time);
        return occTime >= start && occTime < end;
      });
    });
    
    const totalBooked = bookedRooms.length;
    const totalUtilized = utilizedBookings.length;

    // Return the percentage of booked rooms that were utilized
    return totalBooked > 0 ? Math.round((totalUtilized / totalBooked) * 100) : 0;
  };

  const bookedUtilizedPercentage = calculateBookedUtilized();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Booked & Utilized</h2>
      
      <div className="bg-green-50 p-3 rounded">
        <h3 className="text-sm font-medium text-green-800">Booked & Utilized on {selectedDate}</h3>
        <p className="text-2xl font-bold text-green-600">{bookedUtilizedPercentage}%</p>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <span className="font-medium">Booked & Utilized</span> represents the percentage of booked rooms that were actually utilized.
        </p>
      </div>
    </div>
  );
};

export default BookedUtilizedChart;
