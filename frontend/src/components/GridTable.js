import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine
} from 'recharts';
import '../screens/css/summary.css'

const GridTable = ({ utilizationData, roomsData, selectedBuilding }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i); // 8 AM - 10 PM

  const calculateAverageUtilization = () => {
    let totalUtilization = 0;
    let dataPoints = 0;

    days.forEach(day => {
      hours.forEach(hour => {
        const data = utilizationData[day]?.[hour];
        if (data && !isNaN(data.utilization)) {
          totalUtilization += data.utilization;
          dataPoints++;
        }
      });
    });

    return dataPoints > 0 ? Math.round(totalUtilization / dataPoints) : 0;
  };

  const getAverageUtilizationByHour = () => {
    return hours.map(hour => {
      let total = 0;
      let count = 0;

      days.forEach(day => {
        const data = utilizationData[day]?.[hour];
        if (data && !isNaN(data.utilization)) {
          total += data.utilization;
          count++;
        }
      });

      return {
        hour: `${hour}:00`,
        utilization: count > 0 ? Math.round(total / count) : 0
      };
    });
  };

  const getAverageUtilizationPerDay = () => {
    return days.map(day => {
      let total = 0;
      let count = 0;

      hours.forEach(hour => {
        const data = utilizationData[day]?.[hour];
        if (data && !isNaN(data.utilization)) {
          total += data.utilization;
          count++;
        }
      });

      return {
        day,
        utilization: count > 0 ? Math.round(total / count) : 0
      };
    });
  };

  const getCellColor = (percentage) => {
    if (percentage >= 80) return 'high-utilization';
    if (percentage >= 60) return 'medium-utilization';
    return 'low-utilization';
  };

  const buildingRoomCounts = {
    'SCIS1': 4,
    'SOE/SCIS2': 2
  };

  const getRoomCount = () => {
    if (selectedBuilding) {
      return buildingRoomCounts[selectedBuilding] || roomsData.length;
    }
    return buildingRoomCounts['SCIS1'] + buildingRoomCounts['SOE/SCIS2'];
  };

  const averageUtilization = calculateAverageUtilization();
  const roomCount = getRoomCount();
  const hourlyData = getAverageUtilizationByHour();
  const dailyData = getAverageUtilizationPerDay();

  return (
    <div className="utilization-container">
      <h1>Utilization Summary</h1>
      
      <div className="dashboard-layout">
        <div className="table-container">
          <div className="utilization-grid">
            <div className="grid-row header">
              <div className="grid-cell time-label">Time/Day</div>
              {hours.map(hour => (
                <div key={hour} className="grid-cell hour-header">
                  {hour}:00
                </div>
              ))}
            </div>
            
            {days.map(day => (
              <div key={day} className="grid-row">
                <div className="grid-cell day-label">{day}</div>
                {hours.map(hour => {
                  const data = utilizationData[day]?.[hour] || { utilization: 0 };
                  return (
                    <div 
                      key={`${day}-${hour}`} 
                      className={`grid-cell ${getCellColor(data.utilization)}`}
                      title={`${day} ${hour}:00 - Utilization: ${data.utilization}%`}
                    >
                      {data.utilization}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="summary-panel">
          <div className="summary-card">
            <h3>Space Availability</h3>
            <div className="summary-item">
              <span className="summary-label">Total Rooms:</span>
              <span className="summary-value">{roomCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Utilization:</span>
              <span className="summary-value">{averageUtilization}%</span>
            </div>
          </div>
        </div>
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
      </div>

      {/* Hourly and Daily Utilization Overview Charts - Side by Side */}
      <div className="charts-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        
        {/* Hourly Utilization Overview Chart */}
        <div className="chart-box" style={{ width: '40%' }}>
          <h2>Hourly Utilization Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="utilization" fill="#4CAF50" />
              <ReferenceLine y={70} label="Expected (70%)" stroke="black" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Average Utilization Overview Chart */}
        <div className="chart-box" style={{ width: '40%' }}>
          <h2>Daily Average Utilization Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="utilization" fill="#2196F3" />
              <ReferenceLine y={70} label="Expected (70%)" stroke="black" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default GridTable;