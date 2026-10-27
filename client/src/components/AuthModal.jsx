import React, { useState } from 'react';
import { X, Eye, EyeOff, LoaderCircle, Sparkles, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', apiBase }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleModeSwitch(newMode) {
    setMode(newMode);
    setError('');
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        return setError('Please enter your full name (at least 2 characters).');
      }
      if (formData.password.length < 6) {
        return setError('Password must be at least 6 characters long.');
      }
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match. Please re-enter.');
      }
    } else {
      if (!formData.email.trim() || !formData.password) {
        return setError('Please enter your email and password.');
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? `${apiBase}/auth/signup` : `${apiBase}/auth/login`;
      const bodyPayload = mode === 'signup' ? {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim()
      } : {
        email: formData.email.trim(),
        password: formData.password
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (mode === 'signup' ? 'Failed to create account.' : 'Invalid credentials.'));
      }

      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay auth-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal" role="dialog" aria-modal="true">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={14} />
            <span>KALAKART ACCOUNT</span>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="auth-intro">
          <h2>{mode === 'login' ? 'Welcome back.' : 'Join KalaKart.'}</h2>
          <p>
            {mode === 'login'
              ? 'Sign in to access your orders, saved addresses and artisan crafts.'
              : 'Create an account to track orders, save your delivery details and support Indian artisans.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => handleModeSwitch('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => handleModeSwitch('signup')}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <label className="auth-field">
              <span className="field-label">Full Name *</span>
              <div className="input-wrap">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  disabled={loading}
                />
              </div>
            </label>
          )}

          <label className="auth-field">
            <span className="field-label">Email Address *</span>
            <div className="input-wrap">
              <Mail size={16} className="field-icon" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </label>

          <label className="auth-field">
            <span className="field-label">Password *</span>
            <div className="input-wrap">
              <Lock size={16} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                disabled={loading}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {mode === 'signup' && (
            <>
              <label className="auth-field">
                <span className="field-label">Confirm Password *</span>
                <div className="input-wrap">
                  <Lock size={16} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <div className="auth-two-col">
                <label className="auth-field">
                  <span className="field-label">Phone (Optional)</span>
                  <div className="input-wrap">
                    <Phone size={16} className="field-icon" />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span className="field-label">Delivery Address (Optional)</span>
                  <div className="input-wrap">
                    <MapPin size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder="Street, City, PIN"
                      value={formData.address}
                      onChange={e => handleChange('address', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </label>
              </div>
            </>
          )}

          <button className="primary-button full-button auth-submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spin" size={16} />
                <span>{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button type="button" className="text-link-button" onClick={() => handleModeSwitch('signup')}>
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already registered with KalaKart?{' '}
              <button type="button" className="text-link-button" onClick={() => handleModeSwitch('login')}>
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
