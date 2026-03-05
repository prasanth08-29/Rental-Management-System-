import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TrendingUp, BarChart3, Filter, AlertCircle, ShoppingBag, Users, PieChart as PieIcon, Award, DollarSign } from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';

const ANALYTICS_API = `${import.meta.env.VITE_API_URL}/dashboard/analytics`;
const STATS_API = `${import.meta.env.VITE_API_URL}/dashboard/stats`;

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const Analytics = () => {
    const [data, setData] = useState({
        timeline: [],
        topProducts: [],
        statusDistribution: []
    });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Analytics filters
    const [range, setRange] = useState('last30days');
    const [groupBy, setGroupBy] = useState('day');

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(STATS_API);
            setStats(res.data);
        } catch (err) {
            console.error('Stats Fetch Error:', err);
        }
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${ANALYTICS_API}?range=${range}&groupBy=${groupBy}`, {
                headers: { 'x-auth-token': token }
            });
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Analytics Fetch Error:', err);
            setError(err.response?.data?.message || 'Failed to fetch analytics data');
            setLoading(false);
        }
    }, [range, groupBy]);

    useEffect(() => {
        fetchStats();
        fetchAnalytics();
    }, [fetchStats, fetchAnalytics]);

    const totalRevenue = data.timeline.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBookings = data.timeline.reduce((acc, curr) => acc + curr.bookings, 0);
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    if (error) return <div className="animate-fade"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Business Analytics</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <Filter size={16} color="var(--text-muted)" />
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            style={{ border: 'none', background: 'transparent', margin: 0, padding: 0, fontWeight: 'bold', width: 'auto', cursor: 'pointer' }}
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
                <AnalyticsStatCard
                    title="Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    subValue={`${range.replace('last', 'Last ')}`}
                    icon={<TrendingUp size={24} color="#6366f1" />}
                    color="rgba(99, 102, 241, 0.1)"
                />
                <AnalyticsStatCard
                    title="Avg. Booking"
                    value={`₹${Math.round(avgBookingValue).toLocaleString()}`}
                    subValue="Per customer"
                    icon={<DollarSign size={24} color="#10b981" />}
                    color="rgba(16, 185, 129, 0.1)"
                />
                <AnalyticsStatCard
                    title="Total Orders"
                    value={totalBookings}
                    subValue="Converted leads"
                    icon={<ShoppingBag size={24} color="#8b5cf6" />}
                    color="rgba(139, 92, 246, 0.1)"
                />
                {stats && (
                    <AnalyticsStatCard
                        title="Retention"
                        value={stats.activeRentals || 0}
                        subValue="Active users"
                        icon={<Users size={24} color="#f59e0b" />}
                        color="rgba(245, 158, 11, 0.1)"
                    />
                )}
            </div>

            {/* Revenue Trends Chart */}
            <div className="glass-card" style={{ padding: '2rem', background: 'white', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={20} color="var(--primary)" /> Revenue Trends
                        </h3>
                    </div>

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
                                color: groupBy === 'month' ? 'var(--primary)' : 'var(--text-muted)'
                            }}
                        >Monthly</button>
                    </div>
                </div>

                <div style={{ height: '350px', width: '100%' }}>
                    {loading ? <div className="loading-placeholder">Loading...</div> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.timeline}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="amount" name="Revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Top Products */}
                <div className="glass-card" style={{ padding: '2rem', background: 'white' }}>
                    <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Award size={20} color="#f59e0b" /> Top Performing Products
                    </h3>
                    <div style={{ height: '300px' }}>
                        {loading ? <div className="loading-placeholder">Loading...</div> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topProducts} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                                        {data.topProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="glass-card" style={{ padding: '2rem', background: 'white' }}>
                    <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieIcon size={20} color="#10b981" /> Order Status Distribution
                    </h3>
                    <div style={{ height: '300px' }}>
                        {loading ? <div className="loading-placeholder">Loading...</div> : data.statusDistribution.length === 0 ? <p>No status data</p> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {data.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalyticsStatCard = ({ title, value, subValue, icon, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{title}</p>
            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</h3>
            {subValue && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subValue}</p>}
        </div>
    </div>
);

export default Analytics;
