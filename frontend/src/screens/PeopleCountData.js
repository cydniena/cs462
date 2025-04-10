import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/data.css';

function PeopleCountData() {
    const [peopleCounts, setPeopleCounts] = useState([]);
    const [filteredCounts, setFilteredCounts] = useState([]);
    const [newCount, setNewCount] = useState({ timestamp: '', people_count: '' });
    const [filters, setFilters] = useState({ timestamp: '', people_count: '' });

    useEffect(() => {
        axios.get('http://localhost:5005/api/peopleCounts')
            .then((response) => {
                setPeopleCounts(response.data);
                setFilteredCounts(response.data);
            })
            .catch((error) => console.error('Error fetching people counts:', error));
    }, []);

    useEffect(() => {
        setFilteredCounts(
            peopleCounts.filter(entry =>
                Object.keys(filters).every(key => {
                    if (!filters[key]) return true;
                    if (key === 'timestamp') {
                        return entry[key].startsWith(filters[key]);
                    }
                    return entry[key].toString().toLowerCase().includes(filters[key].toString().toLowerCase());
                })
            )
        );
    }, [filters, peopleCounts]);

    const addPeopleCount = () => {
        axios.post('http://localhost:5005/api/peopleCounts', newCount)
            .then((response) => {
                setPeopleCounts([...peopleCounts, response.data]);
                setNewCount({ timestamp: '', people_count: '' });
            })
            .catch((error) => console.error('Error adding people count:', error));
    };

    const deletePeopleCount = (id) => {
        axios.delete(`http://localhost:5005/api/peopleCounts/${id}`)
            .then(() => {
                setPeopleCounts(peopleCounts.filter((entry) => entry._id !== id));
            })
            .catch((error) => console.error('Error deleting people count:', error));
    };

    return (
        <div className="container">
            <h1>People Count Management</h1>

            <div className="form-container">
                <h2>Add New People Count</h2>
                <input
                    type="datetime-local"
                    value={newCount.timestamp}
                    onChange={(e) => setNewCount({ ...newCount, timestamp: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="People Count"
                    value={newCount.people_count}
                    onChange={(e) => setNewCount({ ...newCount, people_count: e.target.value })}
                />
                <button onClick={addPeopleCount}>Add Entry</button>
            </div>

            <div className="filter-container">
                <h2>Filters</h2>
                <input
                    type="date"
                    value={filters.timestamp}
                    onChange={(e) => setFilters({ ...filters, timestamp: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="People Count"
                    value={filters.people_count}
                    onChange={(e) => setFilters({ ...filters, people_count: e.target.value })}
                />
            </div>

            <div className="rooms-list">
                <h2>People Count Entries</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>People Count</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCounts.map((entry) => (
                            <tr key={entry._id}>
                                <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                <td>{entry.people_count}</td>
                                <td>
                                    <button className="delete-btn" onClick={() => deletePeopleCount(entry._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PeopleCountData;
