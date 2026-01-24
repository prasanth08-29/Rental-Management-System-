import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Users, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DASHBOARD_API = `${import.meta.env.VITE_API_URL}/dashboard/stats`;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(DASHBOARD_API);
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-fade"><p>Loading dashboard...</p></div>;

    return (
        <div className="animate-fade">
            <h2 style={{ marginBottom: '2rem' }}>Dashboard Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={<ShoppingBag size={24} color="#6366f1" />}
                    color="rgba(99, 102, 241, 0.1)"
                />
                <StatCard
                    title="Active Rentals"
                    value={stats.activeRentals}
                    icon={<Users size={24} color="#10b981" />}
                    color="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    title="Returns Due Today"
                    value={stats.dueToday.length}
                    icon={<Clock size={24} color="#f59e0b" />}
                    color="rgba(245, 158, 11, 0.1)"
                />
                <StatCard
                    title="Returns Tomorrow"
                    value={stats.dueTomorrow.length}
                    icon={<AlertCircle size={24} color="#ec4899" />}
                    color="rgba(236, 72, 153, 0.1)"
                />
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} color="#f59e0b" /> Urgent Returns (Due Today)
                </h3>

                {stats.dueToday.length === 0 ? (
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

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid rgba(255,255,255,0.6)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</h3>
        </div>
    </div>
);

export default Dashboard;
