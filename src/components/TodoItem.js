
import React from 'react';

const TodoItem = ({ todo, onDelete }) => {
    return (
        <li>
            {todo.text}
            <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
    );
};

export default TodoItem;
