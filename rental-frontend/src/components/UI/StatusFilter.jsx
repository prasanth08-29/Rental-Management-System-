import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const StatusFilter = ({ value, onChange, options = ['Active', 'Overdue', 'Due Today'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                Status
                <ChevronDown size={14} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 10, background: 'white',
                    padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0', minWidth: '150px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: value ? '0.5rem' : 0 }}>
                        {options.map((option) => (
                            <div
                                key={option}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: value === option ? '#e0f2fe' : 'transparent',
                                    color: value === option ? '#0284c7' : 'inherit',
                                    fontSize: '0.9rem',
                                    fontWeight: value === option ? '500' : 'normal',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => { if (value !== option) e.target.style.background = '#f8fafc'; }}
                                onMouseLeave={(e) => { if (value !== option) e.target.style.background = 'transparent'; }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                    {value && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                                setIsOpen(false);
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
        </div>
    );
};

export default StatusFilter;
