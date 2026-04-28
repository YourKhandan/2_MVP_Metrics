// src/components/Navbar.jsx
import React from 'react';
import './Navbar.css';

const Navbar = ({ activePage, setActivePage }) => {
    return (
        <nav className="navbar">
            <div className="nav-brand">
                <span className="brand-icon">📊</span>
                <span className="brand-text">DevInsights</span>
            </div>
            <div className="nav-links">
                <button 
                    className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
                    onClick={() => setActivePage('home')}
                >
                    
                    Home
                </button>
                <button 
                    className={`nav-link ${activePage === 'manager' ? 'active' : ''}`}
                    onClick={() => setActivePage('manager')}
                >
                    
                    Manager Summary
                </button>
            </div>
        </nav>
    );
};

export default Navbar;