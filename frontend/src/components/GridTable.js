import React from 'react';
import '../screens/css/summary.css'

const GridTable = ({ utilizationData, roomsData }) => {
  // Function to calculate average utilization
  const calculateAverageUtilization = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 15 }, (_, i) => 8 + i);
    
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

  const getCellColor = (percentage) => {
    if (percentage >= 80) return 'high-utilization';
    if (percentage >= 60) return 'medium-utilization';
    return 'low-utilization';
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i);
  const averageUtilization = calculateAverageUtilization();

  return (
    <div className="utilization-container">
      <h1>Utilization Summary</h1>
      
      <div className="dashboard-layout">
        {/* Left side - Utilization Table */}
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

        {/* Right side - Summary Panel */}
        <div className="summary-panel">
          <div className="summary-card">
            <h3>Space Availability</h3>
            <div className="summary-item">
              <span className="summary-label">Total Rooms:</span>
              <span className="summary-value">6</span>
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
    </div>
  );
};

export default GridTable;