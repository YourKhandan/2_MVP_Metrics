// src/components/ManagerSummary.jsx
import React, { useState, useEffect } from 'react';
import './ManagerSummary.css';
import dat from 'C:/Extras/Projects/Internship/2_MVP_Metrics/src/components/Manager_Sample_View.json'
const ManagerSummary = () => {
    const [managerData, setManagerData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Manager summary data
    useEffect(() => {
        // This data would come from Excel's manager summary sheet
        const data = dat
        setManagerData(data);
        setFilteredData(data);
    }, []);

    // Filter by month
    useEffect(() => {
        if (selectedMonth === 'all') {
            setFilteredData(managerData);
        } else {
            setFilteredData(managerData.filter(item => item.month === selectedMonth));
        }
    }, [selectedMonth, managerData]);

    // Sorting function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        
        const sortedData = [...filteredData].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredData(sortedData);
    };

    const getSignalBadge = (signal) => {
        if (signal === 'Healthy flow') {
            return <span className="signal-badge healthy">🟢 Healthy flow</span>;
        }
        return <span className="signal-badge warning">🟡 Watch bottlenecks</span>;
    };

    const months = ['all', ...new Set(managerData.map(item => item.month))];

    // we need a rounding funcion because the values are well approximated
    // Helper function to round numbers
const round = (num, decimals = 1) => {
    if (typeof num !== 'number') return num;
    return Number(num.toFixed(decimals));
};
    return (
        <div className="manager-container">
            <div className="manager-header">
                <h2> Manager Performance Summary</h2>
                <p>Track team metrics and identify bottlenecks across your organization</p>
            </div>

            <div className="manager-controls">
                <div className="filter-box">
                    <label>Filter by Month:</label>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-select"
                    >
                        {months.map(month => (
                            <option key={month} value={month}>
                                {month === 'all' ? 'All Months' : month}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="stats-info">
                    Showing {filteredData.length} of {managerData.length} records
                </div>
            </div>

            <div className="table-wrapper">
                <table className="manager-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('manager_id')}>Manager ID {sortConfig.key === 'manager_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('manager_name')}>Manager Name {sortConfig.key === 'manager_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('month')}>Month {sortConfig.key === 'month' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('team_size')}>Team Size {sortConfig.key === 'team_size' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('avg_lead_time_days')}>Lead Time (days) {sortConfig.key === 'avg_lead_time_days' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('avg_cycle_time_days')}>Cycle Time (days) {sortConfig.key === 'avg_cycle_time_days' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('avg_bug_rate_pct')}>Bug Rate (%) {sortConfig.key === 'avg_bug_rate_pct' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('signal')}>Signal {sortConfig.key === 'signal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                        </tr>
                    </thead>
                    <tbody>
                       
                        {filteredData.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.manager_id}</td>
                                <td>{row.manager_name}</td>
                                <td>{row.month}</td>
                                <td>{row.team_size}</td>
                                <td>{round(row.avg_lead_time_days)}</td>
                                <td>{round(row.avg_cycle_time_days)}</td>
                                <td>{round(row.avg_bug_rate_pct)}%</td>
                                <td>{getSignalBadge(row.signal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="no-data">No data found for selected filters</div>
                )}
            </div>
        </div>
    );
};

export default ManagerSummary;