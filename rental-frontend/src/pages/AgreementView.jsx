import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Download, Clock, Trash2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/UI/ConfirmationModal';

const RENTALS_API = `${import.meta.env.VITE_API_URL}/rentals`;

const AgreementView = () => {
    const { id } = useParams();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [newEndDate, setNewEndDate] = useState('');
    const navigate = useNavigate();

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const isAdmin = sessionStorage.getItem('userRole') === 'admin';

    useEffect(() => {
        const fetchRental = async () => {
            try {
                const res = await axios.get(`${RENTALS_API}/${id}`);
                setRental(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchRental();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const element = document.querySelector('.agreement-content');
        const opt = {
            margin: [10, 10],
            filename: `Agreement_${rental?.clientName || 'Document'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const openExtendModal = () => {
        // Set default new date to 1 day after current end date
        const currentEnd = new Date(rental.endDate);
        currentEnd.setDate(currentEnd.getDate() + 1);
        setNewEndDate(currentEnd.toISOString().split('T')[0]);
        setShowExtendModal(true);
    };

    const handleExtend = async () => {
        if (!newEndDate) return;

        try {
            await axios.put(`${RENTALS_API}/${id}/extend`, {
                newEndDate
            });
            setShowExtendModal(false);
            toast.success('Agreement extended successfully');
            // Refresh rental data
            const res = await axios.get(`${RENTALS_API}/${id}`);
            setRental(res.data);
        } catch (err) {
            toast.error('Failed to extend agreement');
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`${RENTALS_API}/${id}`, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Agreement deleted successfully');
            navigate('/agreements');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete agreement');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) return <p>Loading agreement...</p>;
    if (!rental) return <p>Agreement not found.</p>;

    return (
        <div className="animate-fade">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/agreements" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-muted)' }}>
                    <ArrowLeft size={18} /> Back to Agreements
                </Link>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Download PDF
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Printer size={18} /> Print Agreement
                    </button>
                    <button className="btn btn-secondary" onClick={openExtendModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', color: '#d97706', border: 'none' }}>
                        <Clock size={18} /> Extend
                    </button>
                    {isAdmin && (
                        <button className="btn btn-secondary" onClick={handleDeleteClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none' }}>
                            <Trash2 size={18} /> Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '3rem', background: 'white', minHeight: '800px', boxShadow: '0 0 40px rgba(0,0,0,0.05)' }}>
                <div
                    className="agreement-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeAgreementHtml(rental.agreementHtml) }}
                />
            </div>

            {showExtendModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Extend Agreement</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New End Date</label>
                            <input
                                type="date"
                                value={newEndDate}
                                onChange={(e) => setNewEndDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn" onClick={() => setShowExtendModal(false)} style={{ background: '#f1f5f9' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleExtend}>Confirm Extension</button>
                        </div>
                    </div>
                </div>
                </div>
    )
}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Agreement"
                message="Are you sure you want to delete this agreement? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />

            <style>
                {`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            .container { max-width: 100% !important; padding: 0 !important; }
            .glass-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          }
          
          .agreement-content h1 { text-align: center; margin-bottom: 2rem; color: black; font-size: 24px; }
          .agreement-content p { line-height: 1.6; margin-bottom: 1rem; color: #333; }
          .agreement-content strong { color: black; }
          .agreement-content img { max-width: 100%; height: auto; }
          .agreement-content table { width: 100%; border-collapse: collapse; }
          
          @media (max-width: 768px) {
            .agreement-content h1 { font-size: 20px; }
            .agreement-content { font-size: 14px; }
            .glass-card {
                padding: 1.5rem !important; /* Force overrides inline style */
            }
          }
        `}
            </style>
        </div >
    );
};

// Helper function to remove Address from HTML content
const sanitizeAgreementHtml = (html) => {
    if (!html) return '';
    // Removes "Address" fields, handling various HTML structures (lists, bold tags, paragraphs)

    // 1. Handle List Items (e.g., <li><strong>Address:</strong> ...</li>)
    // Matches <li>, optional tags, "Address:", anything else, </li>
    let sanitized = html.replace(/<li>\s*(?:<[^>]+>)*\s*Address:\s*.*?<\/li>/gi, '');

    // 2. Handle Paragraphs (e.g., <p>Address: ...</p>)
    sanitized = sanitized.replace(/<p>\s*(?:<[^>]+>)*\s*Address:\s*.*?<\/p>/gi, '');

    // 3. Handle simple "Address: value<br>" pattern
    sanitized = sanitized.replace(/(?:<[^>]+>)*\s*Address:\s*.*?<br\s*\/?>/gi, '');

    // 4. Remove loose artifacts like "Address: {{CLIENT_ADDRESS}}"
    sanitized = sanitized.replace(/Address:\s*{{CLIENT_ADDRESS}}/gi, '');

    return sanitized;
};

export default AgreementView;
