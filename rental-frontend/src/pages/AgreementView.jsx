import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const RENTALS_API = `${import.meta.env.VITE_API_URL}/rentals`;

const AgreementView = () => {
    const { id } = useParams();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <p>Loading agreement...</p>;
    if (!rental) return <p>Agreement not found.</p>;

    return (
        <div className="animate-fade">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link to="/agreements" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-muted)' }}>
                    <ArrowLeft size={18} /> Back to Agreements
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Download PDF
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Printer size={18} /> Print Agreement
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '3rem', background: 'white', minHeight: '800px', boxShadow: '0 0 40px rgba(0,0,0,0.05)' }}>
                <div
                    className="agreement-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeAgreementHtml(rental.agreementHtml) }}
                />
            </div>

            <style>
                {`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            .container { max-width: 100% !important; padding: 0 !important; }
            .glass-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          }
          .agreement-content h1 { text-align: center; margin-bottom: 2rem; color: black; }
          .agreement-content p { line-height: 1.6; margin-bottom: 1rem; color: #333; }
          .agreement-content strong { color: black; }
        `}
            </style>
        </div>
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
