import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
import { Save, Info, Code } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/templates`;

const AdminTemplate = () => {
    const [content, setContent] = useState('');
    const [initialContent, setInitialContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCode, setShowCode] = useState(false);

    useEffect(() => {
        fetchTemplate();
    }, []);

    const fetchTemplate = async () => {
        try {
            const res = await axios.get(API_URL);
            const loadedContent = res.data.content || '';
            setContent(loadedContent);
            setInitialContent(loadedContent);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const loadingToast = toast.loading('Saving template...');
        try {
            await axios.post(API_URL, { content });
            setInitialContent(content);
            toast.success('Template saved successfully!', { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error('Error saving template', { id: loadingToast });
        }
    };

    if (loading) return <p>Loading template...</p>;

    return (
        <div className="animate-fade">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2>Agreement Template Editor</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>

                    {content !== initialContent && (
                        <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> Save Template
                        </button>
                    )}
                </div>
            </div>



            <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <button
                            className="btn"
                            onClick={() => setShowCode(!showCode)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: showCode ? '#e2e8f0' : '#f1f5f9',
                                border: '1px solid #cbd5e1'
                            }}
                        >
                            <Code size={18} /> {showCode ? 'Hide Source Code' : 'Edit Source Code'}
                        </button>
                    </div>

                    {showCode && (
                        <div className="animate-fade" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <Info color="#3b82f6" size={20} />
                                    <strong>Dynamic Placeholders:</strong>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    {['CLIENT_NAME', 'CLIENT_PHONE', 'PRODUCT_NAME', 'SERIAL_NUMBER', 'PICKUP_DATE', 'END_DATE', 'RENTAL_RATE', 'SECURITY_DEPOSIT', 'DELIVERY_CHARGES', 'TOTAL_CHARGE', 'AGREEMENT_DATE'].map(tag => (
                                        <code key={tag} style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                                            {"{{" + tag + "}}"}
                                        </code>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: 'bold' }}>Template HTML Code</label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Edit the raw HTML below</span>
                            </div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ height: '400px', width: '100%', fontFamily: 'monospace', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem', lineHeight: '1.5' }}
                                placeholder="Paste your agreement HTML here..."
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>Template Preview</label>
                    <div
                        className="glass-card"
                        style={{ padding: '2rem', background: '#f9fafb', border: '1px solid #eee', minHeight: '300px' }}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminTemplate;
