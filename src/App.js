import React from 'react';
import TodoList from './components/TodoList';
import image from './assets/image.jpg'; 
import './App.css'; 

const App = () => {
    return (
        <div className="app-container">
            <img 
              src={image} 
              alt="Todo Summary Assistant Logo" 
              style={{ width: '150px', marginBottom: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
            />
            <h1 style={{ color: 'black' }}>Todo Summary Assistant</h1>
            <TodoList />
        </div>
    );
};

export default App;
