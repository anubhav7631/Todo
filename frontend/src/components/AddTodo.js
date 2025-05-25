import React, { useState } from 'react';
import axios from 'axios';

const AddTodo = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (text) {
            try {
                const response = await axios.post('/todos', { text });
                onAdd(response.data);
                setText('');
            } catch (err) {
                setError('Failed to add todo. Please try again.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new todo"
            />
            <button type="submit" className='font'>Add</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
};

export default AddTodo;
