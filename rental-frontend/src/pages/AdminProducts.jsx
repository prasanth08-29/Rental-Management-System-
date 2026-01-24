import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerDay: '',
        stock: '',
        securityDeposit: '',
        deliveryCharges: '',
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(page);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, page]);

    const fetchProducts = async (pageNumber = 1) => {
        try {
            setLoading(true);
            let url = `${API_URL}?page=${pageNumber}&limit=12`; // Grid layout limit
            if (search) url += `&search=${search}`;

            const res = await axios.get(url);
            if (res.data.products) {
                setProducts(res.data.products);
                setTotalPages(res.data.totalPages);
            } else {
                setProducts(res.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await axios.put(`${API_URL}/${editingProduct._id}`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', pricePerDay: '', stock: '', securityDeposit: '', deliveryCharges: '' });
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            pricePerDay: product.pricePerDay,
            stock: product.stock,
            securityDeposit: product.securityDeposit || '',
            deliveryCharges: product.deliveryCharges || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchProducts();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <>
            <div className="animate-fade">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2>Product Management</h2>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '250px', marginBottom: 0 }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', pricePerDay: '', stock: '', securityDeposit: '', deliveryCharges: '' }); setShowModal(true); }}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Product
                    </button>
                </div>

                {loading ? <p>Loading...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {products.map(product => (
                            <div key={product._id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{product.description}</p>
                                    </div>
                                    <Package size={24} color="var(--primary)" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold' }}>₹{product.pricePerDay}/day</span>
                                        <span style={{ color: 'var(--text-muted)' }}>Stock: {product.stock}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Security Deposit:</span>
                                        <span>₹{product.securityDeposit || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Delivery Charges:</span>
                                        <span>₹{product.deliveryCharges || 0}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" onClick={() => handleEdit(product)} style={{ background: '#f1f5f9', flex: 1 }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn" onClick={() => handleDelete(product._id)} style={{ background: '#fee2e2', color: '#ef4444', flex: 1 }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && products.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
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
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit}>
                            <label>Product Name</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />

                            <label>Description (Features / Bed Type)</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Price/Day</label>
                                    <input type="number" value={formData.pricePerDay} onChange={e => setFormData({ ...formData, pricePerDay: e.target.value })} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Stock</label>
                                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Security Deposit</label>
                                    <input type="number" value={formData.securityDeposit} onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Delivery Charges</label>
                                    <input type="number" value={formData.deliveryCharges} onChange={e => setFormData({ ...formData, deliveryCharges: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#f1f5f9' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminProducts;
