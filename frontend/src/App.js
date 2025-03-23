// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', description: '' });

    // Fetch all items from the backend
    useEffect(() => {
        axios.get('http://localhost:5000/api/items')
            .then((response) => setItems(response.data))
            .catch((error) => console.error('Error fetching items:', error));
    }, []);

    // Add a new item
    const addItem = () => {
        axios.post('http://localhost:5000/api/items', newItem)
            .then((response) => {
                setItems([...items, response.data]);
                setNewItem({ name: '', description: '' });
            })
            .catch((error) => console.error('Error adding item:', error));
    };

    // Delete an item
    const deleteItem = (id) => {
        axios.delete(`http://localhost:5000/api/items/${id}`)
            .then(() => {
                setItems(items.filter((item) => item._id !== id));
            })
            .catch((error) => console.error('Error deleting item:', error));
    };

    return (
        <div>
            <h1>React + Express + MongoDB CRUD App</h1>
            <div>
                <h2>Add New Item</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <button onClick={addItem}>Add Item</button>
            </div>
            <div>
                <h2>Items List</h2>
                <ul>
                    {items.map((item) => (
                        <li key={item._id}>
                            <strong>{item.name}</strong>: {item.description}
                            <button onClick={() => deleteItem(item._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;