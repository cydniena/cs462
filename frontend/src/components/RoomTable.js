import React from 'react';

const RoomTable = ({ rooms }) => {
    return (
        <div>
            <h2>Rooms Data</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Facility Name</th>
                        <th>Time</th>
                        <th>Current Count</th>
                        <th>Capacity</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room, index) => (
                        <tr key={index}>
                            <td>{room["Facility Name"]}</td>
                            <td>{new Date(room["Time"]).toLocaleString()}</td>
                            <td>{room["Count"]}</td>
                            <td>{room["Capacity"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTable;
