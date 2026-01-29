import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Settings, LogOut, ChevronRight, User } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdminPath = location.pathname.startsWith('/admin');

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userRole');
        navigate('/');
    };

    const mainLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, visible: !isAdminPath },
        { name: 'Booking', path: '/', icon: <LayoutDashboard size={20} />, visible: !isAdminPath },
        { name: 'Products', path: '/admin/products', icon: <Package size={20} />, visible: isAdminPath },
        { name: 'Template', path: '/admin/template', icon: <Settings size={20} />, visible: isAdminPath },
        { name: 'Users', path: '/admin/users', icon: <User size={20} />, visible: isAdminPath },
        { name: 'Agreements', path: '/agreements', icon: <FileText size={20} />, visible: !isAdminPath },
    ];

    return (
        <aside className="app-sidebar" style={{ width: '280px', minWidth: '280px', background: 'var(--bg-sidebar)', color: 'var(--text-light)', borderRight: 'none', position: 'fixed', left: 0, top: 0, bottom: 0, overflowY: 'auto', zIndex: 1000, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', whiteSpace: 'nowrap' }}>
            <div className="sidebar-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <NavLink to="/" className="sidebar-logo" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/favicon.jpg" alt="AeonCare Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>AeonCare Rental</span>
                </NavLink>
            </div>

            <nav className="sidebar-nav" style={{ paddingTop: '2rem' }}>
                <div className="nav-section">
                    <span className="section-title" style={{ color: 'rgba(255,255,255,0.4)' }}>Main Menu</span>
                    {mainLinks.filter(link => link.visible).map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            style={({ isActive }) => ({
                                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            })}
                        >
                            <span className="link-icon">{link.icon}</span>
                            <span className="link-text">{link.name}</span>
                        </NavLink>
                    ))}
                    {isAdminPath && (
                        <button
                            onClick={handleLogout}
                            className="nav-link"
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <span className="link-icon"><LogOut size={20} /></span>
                            <span className="link-text">Logout</span>
                        </button>
                    )}
                </div>
            </nav>

            <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="user-profile">
                    <div className="avatar" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>A</div>
                    <div className="user-info">
                        <span className="user-name">Admin</span>
                        <span className="user-role" style={{ color: 'rgba(255,255,255,0.5)' }}>Super Admin</span>
                    </div>
                </div>
                {isAdminPath && (
                    <button className="logout-btn" title="Logout" onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                        <LogOut size={20} />
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
