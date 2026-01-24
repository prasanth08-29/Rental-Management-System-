import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, FileText, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const AgreementManager = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [newEndDate, setNewEndDate] = useState('');

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRentals(page);
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [startDate, endDate, search, page]);

    const fetchRentals = async (pageNumber = 1) => {
        try {
            setLoading(true);
            let url = `${import.meta.env.VITE_API_URL}/rentals`;
            const params = [];

            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);
            if (search) params.push(`search=${search}`);
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

    const openExtendModal = (rental) => {
        setSelectedRental(rental);
        // Set default new date to 1 day after current end date
        const currentEnd = new Date(rental.endDate);
        currentEnd.setDate(currentEnd.getDate() + 1);
        setNewEndDate(currentEnd.toISOString().split('T')[0]);
        setShowExtendModal(true);
    };

    const handleExtend = async () => {
        if (!newEndDate) return;

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/rentals/${selectedRental._id}/extend`, {
                newEndDate
            });
            setShowExtendModal(false);
            toast.success('Agreement extended successfully');
            fetchRentals(); // Refresh list
        } catch (err) {
            toast.error('Failed to extend agreement');
        }
    };

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
                                <th>Client</th>
                                <th>Product</th>
                                <th>Rental Period</th>
                                <th>Status</th>
                                <th>Days Left</th>
                                <th>Actions</th>
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
                                        <tr key={rental._id}>
                                            <td>
                                                <div className="client-info">
                                                    <div className="client-name">{rental.clientName}</div>
                                                    <div className="client-phone">{rental.clientPhone}</div>
                                                </div>
                                            </td>
                                            <td>{rental.product?.name || 'Unknown Product'}</td>
                                            <td>
                                                <div className="date-range">
                                                    <span>{new Date(rental.startDate).toLocaleDateString()}</span>
                                                    <span className="arrow">→</span>
                                                    <span>{new Date(rental.endDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${status.color}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={status.color === 'red' ? 'text-danger' : ''}>
                                                    {calculateDaysRemaining(rental.endDate) < 0
                                                        ? `${Math.abs(calculateDaysRemaining(rental.endDate))} days ago`
                                                        : `${calculateDaysRemaining(rental.endDate)} days`
                                                    }
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Link to={`/agreement/${rental._id}`} className="action-btn view" title="View Agreement">
                                                        <Eye size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => openExtendModal(rental)}
                                                        className="action-btn extend"
                                                        title="Extend Agreement"
                                                    >
                                                        <Clock size={18} />
                                                    </button>
                                                </div>
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

            {showExtendModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Extend Agreement</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New End Date</label>
                            <input
                                type="date"
                                value={newEndDate}
                                onChange={(e) => setNewEndDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn" onClick={() => setShowExtendModal(false)} style={{ background: '#f1f5f9' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleExtend}>Confirm Extension</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgreementManager;
