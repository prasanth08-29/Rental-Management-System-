import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock, Download, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const AgreementManager = () => {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newEndDate, setNewEndDate] = useState('');

    // Filter states
    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [daysLeftFilter, setDaysLeftFilter] = useState('');
    const [showStatusFilter, setShowStatusFilter] = useState(false);
    const [showDaysLeftFilter, setShowDaysLeftFilter] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRentals(page);
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [startDate, endDate, search, statusFilter, daysLeftFilter, page]);

    const fetchRentals = async (pageNumber = 1) => {
        try {
            setLoading(true);
            let url = `${import.meta.env.VITE_API_URL}/rentals`;
            const params = [];

            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);
            if (search) params.push(`search=${search}`);
            if (statusFilter) params.push(`status=${statusFilter}`);
            if (daysLeftFilter) params.push(`daysLeft=${daysLeftFilter}`);
            params.push(`page=${pageNumber}`);
            params.push(`limit=10`);

            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }

            const response = await axios.get(url);
            // Handle new response format { rentals, totalPages, ... } or fallback
            if (response.data.rentals) {
                setRentals(response.data.rentals);
                setTotalPages(response.data.totalPages);
            } else {
                setRentals(response.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch rentals');
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (rentals.length === 0) {
            toast.error('No data to download');
            return;
        }

        // Define CSV headers
        const headers = ['Client Name', 'Client Phone', 'Product', 'Start Date', 'End Date', 'Status', 'Days Left'];

        // Map data to rows
        const rows = rentals.map(rental => {
            const status = getStatus(rental);
            return [
                rental.clientName,
                rental.clientPhone,
                rental.product?.name || 'Unknown',
                new Date(rental.startDate).toLocaleDateString(),
                new Date(rental.endDate).toLocaleDateString(),
                status.label,
                calculateDaysRemaining(rental.endDate)
            ];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const fileName = startDate || endDate
            ? `agreements_${startDate || 'start'}_to_${endDate || 'end'}.csv`
            : 'agreements_all.csv';

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const calculateDaysRemaining = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatus = (rental) => {
        const daysRemaining = calculateDaysRemaining(rental.endDate);
        if (daysRemaining < 0) return { label: 'Overdue', color: 'red', icon: <AlertCircle size={16} /> };
        if (daysRemaining === 0) return { label: 'Due Today', color: 'orange', icon: <Clock size={16} /> };
        return { label: 'Active', color: 'green', icon: <CheckCircle size={16} /> };
    };

    // if (loading) return <div className="loading">Loading agreements...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1>Agreement Manager</h1>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '200px', marginBottom: 0 }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ width: 'auto', marginBottom: 0 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ width: 'auto', marginBottom: 0 }}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleDownload}
                            title="Download Report"
                        >
                            <Download size={18} />
                            <span>Download CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ padding: '0.75rem 1rem' }}>Client</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                                <th style={{ position: 'relative', padding: '0.75rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setShowStatusFilter(!showStatusFilter)}>
                                        Status
                                        <ChevronDown size={14} />
                                    </div>
                                    {showStatusFilter && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, zIndex: 10, background: 'white',
                                            padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                            border: '1px solid #e2e8f0', minWidth: '150px'
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: statusFilter ? '0.5rem' : 0 }}>
                                                {['Active', 'Overdue', 'Due Today'].map((status) => (
                                                    <div
                                                        key={status}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStatusFilter(status);
                                                            setShowStatusFilter(false);
                                                        }}
                                                        style={{
                                                            padding: '0.5rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            background: statusFilter === status ? '#e0f2fe' : 'transparent',
                                                            color: statusFilter === status ? '#0284c7' : 'inherit',
                                                            fontSize: '0.9rem',
                                                            fontWeight: statusFilter === status ? '500' : 'normal'
                                                        }}
                                                        onMouseEnter={(e) => { if (statusFilter !== status) e.target.style.background = '#f8fafc'; }}
                                                        onMouseLeave={(e) => { if (statusFilter !== status) e.target.style.background = 'transparent'; }}
                                                    >
                                                        {status}
                                                    </div>
                                                ))}
                                            </div>
                                            {statusFilter && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setStatusFilter('');
                                                    }}
                                                    style={{
                                                        width: '100%', padding: '0.25rem', background: '#f1f5f9', border: 'none',
                                                        borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b'
                                                    }}
                                                >
                                                    Clear Filter
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentals.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">No agreements found</td>
                                </tr>
                            ) : (
                                rentals.map((rental) => {
                                    const status = getStatus(rental);
                                    return (
                                        <tr
                                            key={rental._id}
                                            onClick={() => navigate(`/agreement/${rental._id}`)}
                                            style={{ cursor: 'pointer' }}
                                            className="hover:bg-slate-50"
                                        >
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div className="client-name">{rental.clientName}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{rental.clientPhone}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{rental.product?.name || 'Unknown Product'}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span className={`status-badge ${status.color}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                    className="btn btn-secondary"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                    Previous
                </button>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Page {page} of {totalPages}
                </span>
                <button
                    className="btn btn-secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                    Next
                </button>
            </div>

        </div>
    );
};

export default AgreementManager;
