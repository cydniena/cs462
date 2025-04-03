import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/data.css'; // Import the CSS file for styling

function BookingData() {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newBooking, setNewBooking] = useState({
        BookingReferenceNumber: '',
        BookingStatus: '',
        BookingStartTime: '',
        BookingEndTime: '',
        Building: '',
        FacilityName: ''
    });

    useEffect(() => {
        axios
            .get('http://localhost:5005/api/bookings')
            .then((response) => setBookings(response.data))
            .catch((error) => console.error('Error fetching bookings:', error));
    }, []);

    const addBooking = () => {
        axios
            .post('http://localhost:5005/api/bookings', newBooking)
            .then((response) => {
                setBookings([...bookings, response.data]);
                setNewBooking({
                    BookingReferenceNumber: '',
                    BookingStatus: '',
                    BookingStartTime: '',
                    BookingEndTime: '',
                    Building: '',
                    FacilityName: ''
                });
            })
            .catch((error) => console.error('Error adding booking:', error));
    };

    const deleteBooking = (id) => {
        axios
            .delete(`http://localhost:5005/api/bookings/${id}`)
            .then(() => {
                setBookings(bookings.filter((booking) => booking._id !== id));
            })
            .catch((error) => console.error('Error deleting booking:', error));
    };

    const filteredBookings = bookings.filter(booking => 
        booking.BookingReferenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.BookingStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.Building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.FacilityName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h1>Occupancy Data Management</h1>
            
            <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
            />

            <div className="form-container">
                <h2>Add New Booking</h2>
                <input type="text" placeholder="Booking Reference Number" value={newBooking.BookingReferenceNumber} onChange={(e) => setNewBooking({ ...newBooking, BookingReferenceNumber: e.target.value })} />
                <input type="text" placeholder="Booking Status" value={newBooking.BookingStatus} onChange={(e) => setNewBooking({ ...newBooking, BookingStatus: e.target.value })} />
                <input type="datetime-local" value={newBooking.BookingStartTime} onChange={(e) => setNewBooking({ ...newBooking, BookingStartTime: e.target.value })} />
                <input type="datetime-local" value={newBooking.BookingEndTime} onChange={(e) => setNewBooking({ ...newBooking, BookingEndTime: e.target.value })} />
                <input type="text" placeholder="Building" value={newBooking.Building} onChange={(e) => setNewBooking({ ...newBooking, Building: e.target.value })} />
                <input type="text" placeholder="Facility Name" value={newBooking.FacilityName} onChange={(e) => setNewBooking({ ...newBooking, FacilityName: e.target.value })} />
                <button onClick={addBooking}>Add Booking</button>
            </div>

            <div className="bookings-list">
                <h2>Bookings List</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Booking Ref No.</th>
                                <th>Status</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Building</th>
                                <th>Facility</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking.BookingReferenceNumber}</td>
                                    <td>{booking.BookingStatus}</td>
                                    <td>{new Date(booking.BookingStartTime).toLocaleString()}</td>
                                    <td>{new Date(booking.BookingEndTime).toLocaleString()}</td>
                                    <td>{booking.Building}</td>
                                    <td>{booking.FacilityName}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => deleteBooking(booking._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default BookingData;
