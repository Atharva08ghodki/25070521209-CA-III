import React, { useState, useEffect } from 'react';
import { X, Package, User, LogOut, Clock, MapPin, Phone, Mail, LoaderCircle, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

export default function AccountModal({
  isOpen,
  onClose,
  user,
  token,
  apiBase,
  onSignOut,
  onUserUpdate,
  initialTab = 'orders',
  setNotice
}) {
  const [tab, setTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      if (initialTab === 'orders') {
        fetchOrders();
      }
    }
  }, [isOpen, initialTab]);

  async function fetchOrders() {
    if (!token) return;
    setLoadingOrders(true);
    setOrdersError('');
    try {
      const res = await fetch(`${apiBase}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Could not load your orders.');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setOrdersError(err.message || 'Error fetching orders.');
    } finally {
      setLoadingOrders(false);
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    if (!token) return;
    setUpdatingProfile(true);
    setProfileMsg('');
    try {
      const res = await fetch(`${apiBase}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }
      onUserUpdate(data.user);
      setProfileMsg('Profile saved to database successfully!');
      if (setNotice) setNotice('Profile updated in MongoDB!');
    } catch (err) {
      setProfileMsg(err.message || 'Failed to save changes.');
    } finally {
      setUpdatingProfile(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="overlay account-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="account-modal" role="dialog" aria-modal="true">
        <div className="account-header">
          <div className="account-user-badge">
            <div className="user-avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3>{user?.name}</h3>
              <span>{user?.email}</span>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close account modal">
            <X size={20} />
          </button>
        </div>

        <div className="account-tabs">
          <button
            type="button"
            className={tab === 'orders' ? 'account-tab active' : 'account-tab'}
            onClick={() => { setTab('orders'); fetchOrders(); }}
          >
            <Package size={15} />
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            className={tab === 'profile' ? 'account-tab active' : 'account-tab'}
            onClick={() => setTab('profile')}
          >
            <User size={15} />
            <span>Profile & Address</span>
          </button>
        </div>

        <div className="account-body">
          {tab === 'orders' && (
            <div className="account-orders-panel">
              {loadingOrders ? (
                <div className="state-message">
                  <LoaderCircle className="spin" size={24} />
                  <span>Retrieving your orders from MongoDB...</span>
                </div>
              ) : ordersError ? (
                <div className="state-message error-state">
                  <span>{ordersError}</span>
                  <button className="outline-button" onClick={fetchOrders}>Try again</button>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders-view">
                  <Package size={40} className="empty-icon" />
                  <h4>No orders placed yet</h4>
                  <p>When you purchase artisan crafts, your orders and tracking will show up right here.</p>
                  <button className="primary-button" onClick={onClose}>
                    Explore handcrafted finds <ArrowUpRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="orders-scroll-list">
                  {orders.map(order => (
                    <article key={order._id} className="user-order-card">
                      <div className="order-card-top">
                        <div>
                          <span className="order-ref">ORDER #{order._id.slice(-8).toUpperCase()}</span>
                          <span className="order-date">
                            <Clock size={12} />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className={`order-status-badge status-${(order.status || 'placed').toLowerCase()}`}>
                          {order.status || 'Placed'}
                        </span>
                      </div>

                      <div className="order-items-compact">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="order-item-row">
                            <span className="item-name">{it.name} <small>× {it.quantity}</small></span>
                            <span className="item-price">{money(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-bottom">
                        <div className="order-ship-to">
                          <MapPin size={12} />
                          <span>{order.customer?.address || 'Standard Delivery'}</span>
                        </div>
                        <div className="order-grand-total">
                          <small>Total</small>
                          <strong>{money(order.total)}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="account-profile-panel">
              <div className="profile-info-banner">
                <Sparkles size={16} />
                <span>Keep your details up to date for fast checkout on future orders. Changes save directly to MongoDB.</span>
              </div>

              {profileMsg && (
                <div className="profile-status-message">
                  <CheckCircle2 size={16} />
                  <span>{profileMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="profile-edit-form">
                <label className="auth-field">
                  <span className="field-label">Full Name</span>
                  <div className="input-wrap">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span className="field-label">Email Address (Read-only)</span>
                  <div className="input-wrap">
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="disabled-input"
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span className="field-label">Contact Phone</span>
                  <div className="input-wrap">
                    <Phone size={16} className="field-icon" />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span className="field-label">Default Delivery Address</span>
                  <div className="input-wrap">
                    <MapPin size={16} className="field-icon" />
                    <textarea
                      rows={3}
                      placeholder="Flat, House no., Building, Street, Area, City, State, PIN"
                      value={profileForm.address}
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    />
                  </div>
                </label>

                <div className="profile-meta-chips">
                  <span>Role: <strong>{user?.role || 'Customer'}</strong></span>
                  {user?.lastLogin && (
                    <span>Last active: <strong>{new Date(user.lastLogin).toLocaleDateString('en-IN')}</strong></span>
                  )}
                </div>

                <button
                  type="submit"
                  className="primary-button full-button"
                  disabled={updatingProfile}
                >
                  {updatingProfile ? (
                    <>
                      <LoaderCircle className="spin" size={16} />
                      <span>Saving to MongoDB...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="account-footer">
          <button
            type="button"
            className="signout-button"
            onClick={onSignOut}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
