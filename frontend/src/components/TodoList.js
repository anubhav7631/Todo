
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddTodo from './AddTodo';
import TodoItem from './TodoItem';

const TodoList = () => {
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        const response = await axios.get('/todos');
        setTodos(response.data);
    };

    const handleAddTodo = (newTodo) => {
        setTodos([...todos, newTodo]);
    };

    const handleDeleteTodo = async (id) => {
        await axios.delete(`/todos/${id}`);
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleSummarize = async () => {
        const response = await axios.post('/summarize');
        alert(response.data.message);
    };

    return (
        <div className='center'>
            <h1 className='bold'>Todo List</h1>
            <AddTodo onAdd={handleAddTodo} />
            <ul>
                {todos.map(todo => (
                    <TodoItem key={todo.id} todo={todo} onDelete={handleDeleteTodo} />
                ))}
            </ul>
            <button className='font-weight' onClick={handleSummarize}>Summarize Todos</button>
        </div>
    );
};

export default TodoList;
