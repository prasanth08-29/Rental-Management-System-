import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Phone, MapPin, ShoppingBag, Hash, ArrowRight } from 'lucide-react';

const PRODUCTS_API = `${import.meta.env.VITE_API_URL}/products`;
const RENTALS_API = `${import.meta.env.VITE_API_URL}/rentals`;

const ClientBooking = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        productId: '',
        rentalRate: '',
        startDate: '',
        endDate: '',
        deliveryMode: 'delivery', // 'delivery' or 'pickup'
        deliveryCharges: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Requesting a high limit to get all products for the dropdown
            const res = await axios.get(`${PRODUCTS_API}?limit=1000`);
            const productsList = res.data.products || [];
            const productsList = res.data.products || [];
            // Simplified: showing all products regardless of stock field
            setProducts(productsList);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleProductChange = (productId) => {
        const selectedProduct = products.find(p => p._id === productId);
        setFormData(prev => ({
            ...prev,
            productId,
            rentalRate: '', // Manual entry required
            // Simplified: Delivery charges always start clean/0, no auto-fill from product
            deliveryCharges: (prev.deliveryMode === 'pickup') ? 0 : ''
        }));
    };

    const handleDeliveryModeChange = (mode) => {
        const selectedProduct = products.find(p => p._id === formData.productId);
        setFormData(prev => ({
            ...prev,
            deliveryMode: mode,
            // Simplified: Pickup forces 0, Delivery keeps existing or blank
            deliveryCharges: mode === 'pickup' ? 0 : prev.deliveryCharges
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post(RENTALS_API, formData);
            navigate(`/agreement/${res.data._id}`);
        } catch (err) {
            console.error(err);
            toast.error('Error creating booking: ' + (err.response?.data?.message || err.message));
            setSubmitting(false);
        }
    };

    if (loading) return <p>Loading products...</p>;

    return (
        <div className="animate-fade" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Product Rental Booking</h1>

            </div>

            <div className="glass-card" style={{ padding: '3rem', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.8)' }}>
                <form onSubmit={handleSubmit}>
                    <div className="grid-responsive">
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                <User size={18} /> Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={formData.clientName}
                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                <Phone size={18} /> Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="Enter phone"
                                value={formData.clientPhone}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val)) {
                                        setFormData({ ...formData, clientPhone: val });
                                    }
                                }}
                                required
                            />
                        </div>
                    </div>



                    <div className="grid-responsive">
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                <ShoppingBag size={18} /> Select Product
                            </label>
                            <select
                                value={formData.productId}
                                onChange={e => handleProductChange(e.target.value)}
                                required
                            >
                                <option value="">-- Choose a product --</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} (SKU: {product.sku}) (Deposit: ₹{product.securityDeposit || 0})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex-responsive">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                <Calendar size={18} /> Pickup Date
                            </label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                <Calendar size={18} /> End Date
                            </label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                            <Hash size={18} /> Rental Rate (Per Day)
                        </label>
                        <input
                            type="number"
                            placeholder="Enter rental rate"
                            value={formData.rentalRate}
                            onChange={e => setFormData({ ...formData, rentalRate: e.target.value })}
                            required
                        />
                    </div>


                    <div className="grid-responsive" style={{ marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                <MapPin size={18} /> Delivery Mode
                            </label>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="deliveryMode"
                                        checked={formData.deliveryMode === 'delivery'}
                                        onChange={() => handleDeliveryModeChange('delivery')}
                                    /> Delivery
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="deliveryMode"
                                        checked={formData.deliveryMode === 'pickup'}
                                        onChange={() => handleDeliveryModeChange('pickup')}
                                    /> Customer Pickup
                                </label>
                            </div>
                        </div>

                        {formData.deliveryMode === 'delivery' && (
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    <Hash size={18} /> Delivery Charges
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter charges"
                                    value={formData.deliveryCharges}
                                    onChange={e => setFormData({ ...formData, deliveryCharges: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
                    >
                        {submitting ? 'Generating Agreement...' : 'Submit'}
                        {!submitting && <ArrowRight size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ClientBooking;
