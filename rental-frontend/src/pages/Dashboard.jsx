import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ShoppingBag, Users, Clock, AlertCircle, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

const STATS_API = `${import.meta.env.VITE_API_URL}/dashboard/stats`;
const ANALYTICS_API = `${import.meta.env.VITE_API_URL}/dashboard/analytics`;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Analytics filters
    const [range, setRange] = useState('last30days');
    const [groupBy, setGroupBy] = useState('day');

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(STATS_API);
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data.';
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            setAnalyticsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${ANALYTICS_API}?range=${range}&groupBy=${groupBy}`, {
                headers: { 'x-auth-token': token }
            });
            setAnalytics(res.data);
            setAnalyticsLoading(false);
        } catch (err) {
            console.error('Analytics Fetch Error:', err);
            setAnalyticsLoading(false);
        }
    }, [range, groupBy]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const totalRevenue = analytics.reduce((acc, curr) => acc + curr.amount, 0);

    if (loading) return <div className="animate-fade"><p>Loading dashboard...</p></div>;
    if (error) return <div className="animate-fade"><p style={{ color: 'red' }}>{error}</p></div>;
    if (!stats) return null;

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Dashboard Overview</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <Filter size={16} color="var(--text-muted)" />
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            style={{ border: 'none', background: 'transparent', margin: 0, padding: 0, fontWeight: 'bold', width: 'auto' }}
                        >
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="last90days">Last 90 Days</option>
                            <option value="lastYear">Last Year</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    title="Estimated Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    subValue={`${range.replace('last', 'Last ')}`}
                    icon={<TrendingUp size={24} color="#6366f1" />}
                    color="rgba(99, 102, 241, 0.1)"
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts || 0}
                    icon={<ShoppingBag size={24} color="#8b5cf6" />}
                    color="rgba(139, 92, 246, 0.1)"
                />
                <StatCard
                    title="Active Rentals"
                    value={stats.activeRentals || 0}
                    icon={<Users size={24} color="#10b981" />}
                    color="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    title="Due Today"
                    value={stats.dueToday?.length || 0}
                    icon={<Clock size={24} color="#f59e0b" />}
                    color="rgba(245, 158, 11, 0.1)"
                />
            </div>

            {/* Analytics Chart Block */}
            <div className="glass-card" style={{ padding: '2rem', background: 'white', marginBottom: '3rem', minHeight: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={20} color="var(--primary)" /> Revenue Trends
                        </h3>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Visualizing income over {range === 'last7days' ? 'the past week' : range === 'last30days' ? 'the past month' : 'the year'}.
                        </p>
                    </div>

                    <div className="flex-responsive" style={{ margin: 0 }}>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                            <button
                                onClick={() => setGroupBy('day')}
                                style={{
                                    border: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: groupBy === 'day' ? 'white' : 'transparent',
                                    boxShadow: groupBy === 'day' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    color: groupBy === 'day' ? 'var(--primary)' : 'var(--text-muted)'
                                }}
                            >Daily</button>
                            <button
                                onClick={() => setGroupBy('month')}
                                style={{
                                    border: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: groupBy === 'month' ? 'white' : 'transparent',
                                    boxShadow: groupBy === 'month' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    color: groupBy === 'month' ? 'var(--primary)' : 'var(--text-muted)'
                                }}
                            >Monthly</button>
                        </div>
                    </div>
                </div>

                <div style={{ height: '350px', width: '100%', marginTop: '1rem' }}>
                    {analyticsLoading ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            Calculating analytics...
                        </div>
                    ) : analytics.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
                            <AlertCircle size={48} opacity={0.3} />
                            <p>No revenue data found for this period.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                    tickFormatter={(val) => groupBy === 'day' ? val.split('-').slice(1).join('/') : val}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} color="#f59e0b" /> Urgent Returns (Due Today)
                </h3>

                {(!stats.dueToday || stats.dueToday.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)' }}>No returns scheduled for today.</p>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Product</th>
                                    <th>Phone</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.dueToday.map(rental => (
                                    <tr key={rental._id}>
                                        <td>{rental.clientName}</td>
                                        <td>{rental.product?.name || 'Unknown'}</td>
                                        <td>{rental.clientPhone}</td>
                                        <td>
                                            <Link to={`/agreement/${rental._id}`} className="btn" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: '#eff6ff', color: 'var(--primary)', textDecoration: 'none' }}>
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subValue, icon, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid rgba(255,255,255,0.6)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</h3>
            {subValue && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subValue}</p>}
        </div>
    </div>
);

export default Dashboard;
