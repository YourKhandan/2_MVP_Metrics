// src/app.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import metricData from './metricExamples.json';
import { evaluateDeveloper, comparePeriods, evaluateTeam } from './evaluation';
import './App.css';

function App() {
    const [data, setData] = useState([]);
    const [selectedDeveloper, setSelectedDeveloper] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previousMonth, setPreviousMonth] = useState('');
    const [activeTab, setActiveTab] = useState('evaluate');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setData(metricData);
        console.log('🎉 Loaded data:', metricData);
    }, []);

    const developers = [...new Set(data.map(item => item.developer_id))];
    const months = [...new Set(data.map(item => item.month))].sort();
    const teams = [...new Set(data.map(item => item.team_name))];

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleEvaluate = async () => {
        if (!selectedDeveloper || !selectedMonth) {
            alert('✨ Please select both developer and month');
            return;
        }

        setLoading(true);
        setShowConfetti(false);
        
        try {
            const result = await evaluateDeveloper(selectedDeveloper, selectedMonth);
            setEvaluationResult(result);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            console.log('✅ Evaluation result:', result);
        } catch (error) {
            console.error('❌ Evaluation error:', error);
            alert('Evaluation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleComparison = async () => {
        if (!selectedDeveloper || !selectedMonth || !previousMonth) {
            alert('📊 Please select developer and both months for comparison');
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

    const clearSelection = () => {
        setSelectedDeveloper('');
        setSelectedMonth('');
        setPreviousMonth('');
        setEvaluationResult(null);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-average';
        return 'score-poor';
    };

    return (
        <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`} ref={containerRef}>
            {/* Mouse-following glow effect */}
            <div 
                className="mouse-glow" 
                style={{ 
                    left: `${mousePosition.x}px`, 
                    top: `${mousePosition.y}px` 
                }} 
            />
            
            {/* Confetti overlay */}
            {showConfetti && <div className="confetti-overlay" />}
            
            {/* Animated background particles */}
            <div className="particles">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        '--delay': `${i * 0.2}s`,
                        '--duration': `${5 + Math.random() * 10}s`,
                        '--size': `${2 + Math.random() * 6}px`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 10}s`
                    }} />
                ))}
            </div>

            {/* Main content */}
            <div className="content-wrapper">
                {/* Header Section */}
                <header className="header">
                    <div className="header-content">
                        <div className="logo">
                            <div className="logo-icon">📊</div>
                            <div className="logo-text">
                                <h1>DevInsights</h1>
                                <span className="logo-subtitle">Developer Intelligence Platform</span>
                            </div>
                        </div>
                        
                        <button 
                            className="theme-toggle"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                    <div className="header-glow" />
                </header>

                {/* Stats Bar */}
                <div className="stats-bar">
                    <div className="stat-card">
                        <div className="stat-icon">👨‍💻</div>
                        <div className="stat-info">
                            <span className="stat-value">{developers.length}</span>
                            <span className="stat-label">Developers</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <span className="stat-value">{months.length}</span>
                            <span className="stat-label">Months</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-info">
                            <span className="stat-value">{teams.length}</span>
                            <span className="stat-label">Teams</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <span className="stat-value">{data.length}</span>
                            <span className="stat-label">Data Points</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'evaluate' ? 'active' : ''}`}
                        onClick={() => setActiveTab('evaluate')}
                    >
                        <span className="tab-icon">🎯</span>
                        Evaluate Developer
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
                        onClick={() => setActiveTab('compare')}
                    >
                        <span className="tab-icon">📊</span>
                        Compare Periods
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                        onClick={() => setActiveTab('insights')}
                    >
                        <span className="tab-icon">💡</span>
                        Team Insights
                    </button>
                    {evaluationResult && (
                        <button 
                            className="tab-btn clear-btn"
                            onClick={clearSelection}
                        >
                            <span className="tab-icon">🗑️</span>
                            Clear Results
                        </button>
                    )}
                </div>

                {/* Main Control Panel */}
                <div className={`control-panel ${activeTab === 'evaluate' ? 'active' : 'hidden'}`}>
                    <div className="panel-glass">
                        <h2 className="panel-title">
                            <span className="title-icon">🎯</span>
                            Developer Performance Evaluation
                        </h2>
                        
                        <div className="selector-grid">
                            <div className="selector-card">
                                <label className="selector-label">
                                    <span className="label-icon">👨‍💻</span>
                                    Select Developer
                                </label>
                                <select 
                                    value={selectedDeveloper} 
                                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                                    className="glass-select"
                                >
                                    <option value="">Choose a developer...</option>
                                    {developers.map(dev => {
                                        const devData = data.find(d => d.developer_id === dev);
                                        return (
                                            <option key={dev} value={dev}>
                                                {dev} - {devData?.developer_name || ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="selector-card">
                                <label className="selector-label">
                                    <span className="label-icon">📅</span>
                                    Select Month
                                </label>
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="glass-select"
                                >
                                    <option value="">Choose a month...</option>
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                className="evaluate-button"
                                onClick={handleEvaluate}
                                disabled={loading || !selectedDeveloper || !selectedMonth}
                            >
                                {loading ? (
                                    <span className="loading-spinner" />
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Compare Periods Panel */}
                <div className={`control-panel ${activeTab === 'compare' ? 'active' : 'hidden'}`}>
                    <div className="panel-glass">
                        <h2 className="panel-title">
                            <span className="title-icon">📈</span>
                            Period Comparison
                        </h2>
                        
                        <div className="selector-grid">
                            <div className="selector-card">
                                <label className="selector-label">👨‍💻 Developer</label>
                                <select 
                                    value={selectedDeveloper} 
                                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                                    className="glass-select"
                                >
                                    <option value="">Select developer...</option>
                                    {developers.map(dev => (
                                        <option key={dev} value={dev}>{dev}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="selector-card">
                                <label className="selector-label">📅 First Month</label>
                                <select 
                                    value={previousMonth} 
                                    onChange={(e) => setPreviousMonth(e.target.value)}
                                    className="glass-select"
                                >
                                    <option value="">Select month...</option>
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="selector-card">
                                <label className="selector-label">📅 Second Month</label>
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="glass-select"
                                >
                                    <option value="">Select month...</option>
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                className="evaluate-button compare-btn"
                                onClick={handleComparison}
                                disabled={loading || !selectedDeveloper || !selectedMonth || !previousMonth}
                            >
                                {loading ? <span className="loading-spinner" /> : '📊 Compare'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Team Insights Panel */}
                <div className={`control-panel ${activeTab === 'insights' ? 'active' : 'hidden'}`}>
                    <div className="panel-glass">
                        <h2 className="panel-title">
                            <span className="title-icon">🏢</span>
                            Team Performance Overview
                        </h2>
                        <div className="team-insights">
                            <p className="coming-soon">✨ Advanced team analytics coming soon!</p>
                            <div className="team-stats-preview">
                                {teams.map(team => {
                                    const teamData = data.filter(d => d.team_name === team);
                                    const avgLeadTime = teamData.reduce((sum, d) => sum + d.avg_lead_time_days, 0) / teamData.length;
                                    return (
                                        <div key={team} className="team-preview-card">
                                            <h4>{team}</h4>
                                            <p>Members: {teamData.length}</p>
                                            <p>Avg Lead Time: {avgLeadTime.toFixed(1)} days</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {evaluationResult && !evaluationResult.error && (
                    <div className="results-section">
                        {/* Developer Hero Card */}
                        <div className="hero-card">
                            <div className="hero-gradient" />
                            <div className="hero-content">
                                <div className="developer-avatar">
                                    {evaluationResult.developer_name?.charAt(0) || '👨‍💻'}
                                </div>
                                <div className="developer-info">
                                    <h2>{evaluationResult.developer_name}</h2>
                                    <p className="developer-meta">
                                        <span className="meta-badge">{evaluationResult.selected_developer}</span>
                                        <span className="meta-badge">{evaluationResult.team}</span>
                                        <span className="meta-badge">{evaluationResult.selected_month}</span>
                                    </p>
                                </div>
                                <div className={`pattern-badge ${evaluationResult.metrics?.pattern_hint?.toLowerCase().replace(' ', '-')}`}>
                                    {evaluationResult.metrics?.pattern_hint}
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-icon">⏱️</div>
                                <div className="metric-content">
                                    <span className="metric-value">{evaluationResult.metrics?.lead_time_days}</span>
                                    <span className="metric-label">Lead Time (days)</span>
                                </div>
                                <div className="metric-trend">
                                    {evaluationResult.metrics?.lead_time_days < 3 ? '📉' : '📈'}
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-icon">🔄</div>
                                <div className="metric-content">
                                    <span className="metric-value">{evaluationResult.metrics?.cycle_time_days}</span>
                                    <span className="metric-label">Cycle Time (days)</span>
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-icon">📦</div>
                                <div className="metric-content">
                                    <span className="metric-value">{evaluationResult.metrics?.pr_throughput}</span>
                                    <span className="metric-label">PR Throughput</span>
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-icon">🚀</div>
                                <div className="metric-content">
                                    <span className="metric-value">{evaluationResult.metrics?.deployment_frequency}</span>
                                    <span className="metric-label">Deployments</span>
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-icon">🐛</div>
                                <div className="metric-content">
                                    <span className={`metric-value ${evaluationResult.metrics?.bug_rate_percent > 30 ? 'danger' : 'success'}`}>
                                        {evaluationResult.metrics?.bug_rate_percent}%
                                    </span>
                                    <span className="metric-label">Bug Rate</span>
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-icon">✅</div>
                                <div className="metric-content">
                                    <span className="metric-value">{evaluationResult.metrics?.issues_done}</span>
                                    <span className="metric-label">Issues Done</span>
                                </div>
                            </div>
                        </div>

                        {/* Interpretations */}
                        <div className="insight-card interpretation">
                            <div className="insight-header">
                                <span className="insight-icon">💭</span>
                                <h3>Performance Interpretation</h3>
                            </div>
                            <div className="insight-list">
                                {evaluationResult.interpretation?.map((item, idx) => (
                                    <div key={idx} className="insight-item">
                                        <span className="insight-bullet">✨</span>
                                        <p>{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="insight-card next-steps">
                            <div className="insight-header">
                                <span className="insight-icon">🎯</span>
                                <h3>Recommended Actions</h3>
                            </div>
                            <div className="steps-list">
                                {evaluationResult.next_steps?.map((step, idx) => (
                                    <div key={idx} className="step-item">
                                        <div className="step-number">{idx + 1}</div>
                                        <p>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="summary-card">
                            <div className="summary-icon">📋</div>
                            <div className="summary-content">
                                <h4>Executive Summary</h4>
                                <p>{evaluationResult.summary}</p>
                            </div>
                        </div>

                        {/* Comparison Results */}
                        {evaluationResult.comparison && (
                            <div className="comparison-card">
                                <h3>📊 Period Comparison: {evaluationResult.comparison.period1.month} → {evaluationResult.comparison.period2.month}</h3>
                                <div className="comparison-grid">
                                    <div className="comparison-period">
                                        <h4>{evaluationResult.comparison.period1.month}</h4>
                                        <p>Lead: {evaluationResult.comparison.period1.lead_time}d</p>
                                        <p>Cycle: {evaluationResult.comparison.period1.cycle_time}d</p>
                                        <p>PRs: {evaluationResult.comparison.period1.prs}</p>
                                        <p>Bugs: {evaluationResult.comparison.period1.bug_rate}%</p>
                                    </div>
                                    <div className="comparison-arrow">→</div>
                                    <div className="comparison-period">
                                        <h4>{evaluationResult.comparison.period2.month}</h4>
                                        <p>Lead: {evaluationResult.comparison.period2.lead_time}d</p>
                                        <p>Cycle: {evaluationResult.comparison.period2.cycle_time}d</p>
                                        <p>PRs: {evaluationResult.comparison.period2.prs}</p>
                                        <p>Bugs: {evaluationResult.comparison.period2.bug_rate}%</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {evaluationResult?.error && (
                    <div className="error-card">
                        <span className="error-icon">⚠️</span>
                        <p>{evaluationResult.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;