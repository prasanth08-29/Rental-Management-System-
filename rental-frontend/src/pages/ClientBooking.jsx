import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, User, Phone, MapPin, ShoppingBag, Hash, ArrowRight,
    Truck, Package, CreditCard, Clock, CheckCircle
} from 'lucide-react';
import './ClientBooking.css';

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
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${PRODUCTS_API}?limit=1000`);
            setProducts(res.data.products || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load products");
            setLoading(false);
        }
    };

    const handleProductChange = (productId) => {
        const product = products.find(p => p._id === productId);
        setSelectedProductDetails(product || null);

        setFormData(prev => ({
            ...prev,
            productId,
            rentalRate: '', // Manual entry required
            deliveryCharges: (prev.deliveryMode === 'pickup') ? 0 : ''
        }));
    };

    const handleDeliveryModeChange = (mode) => {
        setFormData(prev => ({
            ...prev,
            deliveryMode: mode,
            deliveryCharges: mode === 'pickup' ? 0 : prev.deliveryCharges
        }));
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0; // Return 0 if same day or invalid
    };

    const calculateTotal = () => {
        const days = calculateDays();
        const rate = parseFloat(formData.rentalRate) || 0;
        const delivery = parseFloat(formData.deliveryCharges) || 0;
        return (days * rate) + delivery;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post(RENTALS_API, formData);
            toast.success('Booking created successfully!');
            navigate(`/agreement/${res.data._id}`);
        } catch (err) {
            console.error(err);
            toast.error('Error creating booking: ' + (err.response?.data?.message || err.message));
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="booking-page-container">
            <div className="booking-content-wrapper">

                {/* Header */}
                <div className="booking-header animate-fade">
                    <h1>Start Your Rental</h1>
                    <p>Complete the form below to book your equipment instantly.</p>
                </div>

                {/* Left Column: Form */}
                <div className="glass-panel animate-fade delay-100">
                    <form onSubmit={handleSubmit}>

                        {/* Client Details Section */}
                        <div className="form-section">
                            <h3 className="form-section-title">
                                <User size={20} className="text-blue-500" />
                                Client Information
                            </h3>
                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div className="input-wrapper">
                                        <User size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="John Doe"
                                            value={formData.clientName}
                                            onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <div className="input-wrapper">
                                        <Phone size={18} className="input-icon" />
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="9876543210"
                                            value={formData.clientPhone}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) setFormData({ ...formData, clientPhone: val });
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rental Details Section */}
                        <div className="form-section">
                            <h3 className="form-section-title">
                                <Package size={20} className="text-blue-500" />
                                Rental Details
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Select Equipment</label>
                                <div className="input-wrapper">
                                    <ShoppingBag size={18} className="input-icon" />
                                    <select
                                        className="form-select"
                                        value={formData.productId}
                                        onChange={e => handleProductChange(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose a product --</option>
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.name} (SKU: {product.sku})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label className="form-label">Pickup Date</label>
                                    <div className="input-wrapper">
                                        <Calendar size={18} className="input-icon" />
                                        <input
                                            type="date"
                                            className="form-input"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Return Date</label>
                                    <div className="input-wrapper">
                                        <Calendar size={18} className="input-icon" />
                                        <input
                                            type="date"
                                            className="form-input"
                                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Daily Rental Rate (₹)</label>
                                <div className="input-wrapper">
                                    <Hash size={18} className="input-icon" />
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0.00"
                                        value={formData.rentalRate}
                                        onChange={e => setFormData({ ...formData, rentalRate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery Section */}
                        <div className="form-section">
                            <h3 className="form-section-title">
                                <Truck size={20} className="text-blue-500" />
                                Delivery Method
                            </h3>
                            <div className="form-group">
                                <div className="delivery-options">
                                    <label className={`delivery-option-card ${formData.deliveryMode === 'delivery' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="deliveryMode"
                                            checked={formData.deliveryMode === 'delivery'}
                                            onChange={() => handleDeliveryModeChange('delivery')}
                                        />
                                        <Truck size={24} className="delivery-icon" />
                                        <span className="font-semibold">Home Delivery</span>
                                    </label>
                                    <label className={`delivery-option-card ${formData.deliveryMode === 'pickup' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="deliveryMode"
                                            checked={formData.deliveryMode === 'pickup'}
                                            onChange={() => handleDeliveryModeChange('pickup')}
                                        />
                                        <MapPin size={24} className="delivery-icon" />
                                        <span className="font-semibold">Self Pickup</span>
                                    </label>
                                </div>
                            </div>

                            {formData.deliveryMode === 'delivery' && (
                                <div className="form-group animate-fade">
                                    <label className="form-label">Delivery Charges (₹)</label>
                                    <div className="input-wrapper">
                                        <CreditCard size={18} className="input-icon" />
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0.00"
                                            value={formData.deliveryCharges}
                                            onChange={e => setFormData({ ...formData, deliveryCharges: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : 'Confirm Booking'}
                            {!submitting && <ArrowRight size={20} />}
                        </button>
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="glass-panel summary-panel animate-fade delay-200">
                    <div className="summary-title">
                        <span>Order Summary</span>
                        <CheckCircle size={24} className="text-green-500" />
                    </div>

                    {selectedProductDetails ? (
                        <>
                            <div className="summary-item">
                                <span className="summary-label">Product</span>
                                <span className="summary-value">{selectedProductDetails.name}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">SKU</span>
                                <span className="summary-value">{selectedProductDetails.sku}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Security Deposit</span>
                                <span className="summary-value">₹{selectedProductDetails.securityDeposit || 0}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Duration</span>
                                <span className="summary-value">{calculateDays()} Days</span>
                            </div>

                            <div className="total-section">
                                <div className="total-row">
                                    <span className="total-label">Subtotal</span>
                                    <span style={{ fontWeight: 600 }}>₹{(calculateDays() * (parseFloat(formData.rentalRate) || 0)).toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span className="total-label">Delivery</span>
                                    <span style={{ fontWeight: 600 }}>₹{parseFloat(formData.deliveryCharges || 0).toFixed(2)}</span>
                                </div>
                                <div className="total-row" style={{ marginTop: '0.5rem' }}>
                                    <span className="total-label text-xl">Total</span>
                                    <span className="total-price">₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="placeholder-text">
                            <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p>Select a product to see the cost breakdown</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientBooking;
