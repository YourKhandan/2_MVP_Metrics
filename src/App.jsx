// src/app.jsx
import React, { useState, useEffect } from 'react';
import metricData from './metricExamples.json';
import { evaluateDeveloper, evaluateTeam, comparePeriods } from './evaluation';
import Navbar from './components/Navbar';
import ManagerSummary from './components/ManagerSummary';
function App() {
    const [data, setData] = useState([]);
    const [selectedDeveloper, setSelectedDeveloper] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [previousMonth, setPreviousMonth] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

// Add state for page navigation
const [activePage, setActivePage] = useState('home');

useEffect(() => {
    const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);

    useEffect(() => {
        setData(metricData);
        console.log('Loaded data:', metricData);
    }, []);

    const developers = [...new Set(data.map(item => item.developer_id))];
    const months = [...new Set(data.map(item => item.month))].sort();

    const handleEvaluate = async () => {
        if (!selectedDeveloper || !selectedMonth) {
            alert('Please select both developer and month');
            return;
        }

        setLoading(true);
        try {
            const result = await evaluateDeveloper(selectedDeveloper, selectedMonth);
            setEvaluationResult(result);//shows json of 
            console.log('Evaluation result:', result);
        } catch (error) {
            console.error('Evaluation error:', error);
            alert('Evaluation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleComparison = async () => {
        if (!selectedDeveloper || !selectedMonth || !previousMonth) {
            alert('Please select developer and both months for comparison');
            return;
        }

        setLoading(true);
        try {
            const comparison = await comparePeriods(selectedDeveloper, previousMonth, selectedMonth);
            setEvaluationResult(prev => ({
                ...prev,
                comparison: comparison
            }));
        } catch (error) {
            console.error('Comparison error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
      <>
      <Navbar activePage={activePage} setActivePage={setActivePage}/>
      {activePage === 'home' ? (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px` }} className='container'>
            <h1> Developer Evaluation Dashboard</h1>
            
            {/* Selection Panel */}
            <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#1f2028' }} className='devdetes'>
                <h3> Select Developer & Month</h3>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }} >
                    <div className='devname'>
                        <label><strong>Developer:</strong></label>
                        <select 
                            value={selectedDeveloper} 
                            onChange={(e) => setSelectedDeveloper(e.target.value)}
                            style={{ marginLeft: '10px', padding: '8px' }}
                        >
                            <option value="">Select Developer</option>
                            {developers.map(dev => (
                                <option key={dev} value={dev}>{dev}</option>
                            ))}
                        </select>
                    </div>

                    <div className='devmonth'>
                        <label><strong>Month:</strong></label>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{ marginLeft: '10px', padding: '8px' }}
                        >
                            <option value="">Select Month</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleEvaluate} 
                        disabled={loading}
                        style={{ 
                            padding: '8px 20px', 
                            backgroundColor: '#007bff', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Evaluating...' : 'Evaluate'}
                    </button>
                </div>

                {/* Comparison Panel */}
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                    <h4> Compare Periods</h4>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className='cmp_month'>
                            <label>Previous Month:</label>
                            <select 
                                value={previousMonth} 
                                onChange={(e) => setPreviousMonth(e.target.value)}
                                style={{ marginLeft: '10px', padding: '8px' }}
                            >
                                <option value="">Select Month</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={handleComparison}
                            disabled={loading || !selectedDeveloper}
                            style={{ 
                                padding: '8px 20px', 
                                backgroundColor: '#28a745', 
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Compare
                        </button>
                    </div>
                </div>
            </div>

            {/* Evaluation Results */}
            {evaluationResult && !evaluationResult.error && (
                <div style={{backgroundColor:'black'}}>
                    {/* Developer Summary Card */}
                    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #007bff', borderRadius: '8px',  }}>
                        <h2> Developer: {evaluationResult.developer_name} ({evaluationResult.selected_developer})</h2>
                        <h3>Team: {evaluationResult.team}</h3>
                        <h4> Month: {evaluationResult.selected_month}</h4>
                    </div>

                    {/* Metrics Grid */}
                    <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <h4> Lead Time</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{evaluationResult.metrics.lead_time_days} days</p>
                        </div>
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <h4> Cycle Time</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{evaluationResult.metrics.cycle_time_days} days</p>
                        </div>
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <h4> PR Throughput</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{evaluationResult.metrics.pr_throughput} PRs</p>
                        </div>
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <h4> Deployments</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{evaluationResult.metrics.deployment_frequency}</p>
                        </div>
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <h4> Bug Rate</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0', color: evaluationResult.metrics.bug_rate_percent > 30 ? 'red' : 'green' }}>
                                {evaluationResult.metrics.bug_rate_percent}%
                            </p>
                        </div>
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <h4> Pattern</h4>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>{evaluationResult.metrics.pattern_hint}</p>
                        </div>
                    </div>

                    {/* Interpretation */}
                    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ffc107', borderRadius: '8px', backgroundColor: 'rgb(49 47 43)' }} className='interpretation'>
                        <h3> Interpretation</h3>
                        <ul>
                            {evaluationResult.interpretation.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '10px' }}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Next Steps */}
                    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: 'rgb(53 61 53)' }} className='recommended'>
                        <h3>🎯 Recommended Next Steps</h3>
                        <ol>
                            {evaluationResult.next_steps.map((step, idx) => (
                                <li key={idx} style={{ marginBottom: '8px' }}>{step}</li>
                            ))}
                        </ol>
                    </div>

                    {/* Summary */}
                    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #6c757d', borderRadius: '8px', backgroundColor: 'rgb(27 43 58)' }} className='summary'>
                        <h2>Summary</h2>
                        <p>{evaluationResult.summary}</p>
                    </div>

                    {/* Comparison Results */}
                    {evaluationResult.comparison && (
                        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #17a2b8', borderRadius: '8px', backgroundColor: 'rgb(50 60 61)' }} className='comparison'>
                            <h3> Period Comparison</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                <div>
                                    <h4>{evaluationResult.comparison.period1.month}</h4>
                                    <p>Lead time: {evaluationResult.comparison.period1.lead_time} days</p>
                                    <p>Cycle time: {evaluationResult.comparison.period1.cycle_time} days</p>
                                    <p>PRs: {evaluationResult.comparison.period1.prs}</p>
                                    <p>Bug rate: {evaluationResult.comparison.period1.bug_rate}%</p>
                                </div>
                                <div>
                                    <h4>{evaluationResult.comparison.period2.month}</h4>
                                    <p>Lead time: {evaluationResult.comparison.period2.lead_time} days</p>
                                    <p>Cycle time: {evaluationResult.comparison.period2.cycle_time} days</p>
                                    <p>PRs: {evaluationResult.comparison.period2.prs}</p>
                                    <p>Bug rate: {evaluationResult.comparison.period2.bug_rate}%</p>
                                </div>
                            </div>
                            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#353333', borderRadius: '4px' }} className='comparison'>
                                <h4>Changes:</h4>
                                <p>Lead time: {evaluationResult.comparison.changes.lead_time_change > 0 ? '↑' : '↓'} {Math.abs(evaluationResult.comparison.changes.lead_time_change)} days</p>
                                <p>Cycle time: {evaluationResult.comparison.changes.cycle_time_change > 0 ? '↑' : '↓'} {Math.abs(evaluationResult.comparison.changes.cycle_time_change)} days</p>
                                <p>PRs: {evaluationResult.comparison.changes.pr_change > 0 ? '↑' : '↓'} {Math.abs(evaluationResult.comparison.changes.pr_change)}</p>
                                <p>Bug rate: {evaluationResult.comparison.changes.bug_rate_change > 0 ? '↑' : '↓'} {Math.abs(evaluationResult.comparison.changes.bug_rate_change)}%</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {evaluationResult && evaluationResult.error && (
                <div style={{ padding: '20px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px', color: '#721c24' }}>
                    <h3>Error</h3>
                    <p>{evaluationResult.message}</p>
                </div>
            )}
        </div>
      ):(<div className="app-container dark">
                <ManagerSummary /></div>
      )}
        </>
    );
}

export default App;