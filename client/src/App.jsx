import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ShoppingBag,
  ArrowUpRight,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Sparkles,
  Menu,
  LoaderCircle,
  User,
  Package,
  LogOut,
  Lock
} from 'lucide-react';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', email: '', craft: 'Home decor', details: '', budget: '₹1,000–₹3,000' });
  const [customSubmitting, setCustomSubmitting] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kalakart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('kalakart_token') || '');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState('orders');
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('kalakart_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        localStorage.removeItem('kalakart_token');
        localStorage.removeItem('kalakart_user');
        setUser(null);
        setToken('');
      });
  }, [token]);

  useEffect(() => {
    if (user) {
      setCustomer(prev => ({
        name: user.name || prev.name,
        email: user.email || prev.email,
        address: user.address || prev.address
      }));
      setCustomForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (activeCategory !== 'All') params.set('category', activeCategory);
      const response = await fetch(`${API}/products?${params}`);
      if (!response.ok) throw new Error('Could not load products. Is the server running?');
      const data = await response.json();
      setProducts(data);
      setCategories(['All', ...new Set(data.map(p => p.category).filter(Boolean))]);
    } catch (e) {
      setError(`${e.message} Check that the Node server and MongoDB are running.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const featured = useMemo(() => products.filter(p => p.featured).slice(0, 3), [products]);

  function addToCart(product) {
    if (product.stock < 1) return setNotice('Sorry, this item is out of stock.');
    setCart(current => {
      const existing = current.find(item => item._id === product._id);
      if (existing) return current.map(item => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your bag`);
  }

  function changeQuantity(id, delta) {
    setCart(current =>
      current
        .map(item => item._id === id ? { ...item, quantity: Math.max(0, Math.min(item.quantity + delta, item.stock)) } : item)
        .filter(item => item.quantity > 0)
    );
  }

  function handleAuthSuccess(data) {
    if (data.token) {
      localStorage.setItem('kalakart_token', data.token);
      setToken(data.token);
    }
    if (data.user) {
      localStorage.setItem('kalakart_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    setNotice(data.message || `Welcome, ${data.user?.name || 'Artisan friend'}!`);
    if (pendingCheckout) {
      setPendingCheckout(false);
      setCheckoutOpen(true);
    }
  }

  function handleSignOut() {
    localStorage.removeItem('kalakart_token');
    localStorage.removeItem('kalakart_user');
    setUser(null);
    setToken('');
    setAccountModalOpen(false);
    setMobileNav(false);
    setCheckoutOpen(false);
    setPendingCheckout(false);
    setCustomer({ name: '', email: '', address: '' });
    setNotice('You have signed out successfully.');
  }

  function handleUserUpdate(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem('kalakart_user', JSON.stringify(updatedUser));
  }

  function handleProceedToCheckout() {
    setCartOpen(false);
    if (!user) {
      setPendingCheckout(true);
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      setNotice('Please sign in or create an account to place your order.');
      return;
    }
    setCheckoutOpen(true);
  }

  async function submitCustomRequest(event) {
    event.preventDefault();
    setCustomSubmitting(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API}/custom-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(customForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not submit your request.');
      setCustomForm({
        name: user?.name || '',
        email: user?.email || '',
        craft: 'Home decor',
        details: '',
        budget: '₹1,000–₹3,000'
      });
      setNotice('Custom request sent! Saved to database.');
    } catch (e) {
      setNotice(e.message);
    } finally {
      setCustomSubmitting(false);
    }
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!cart.length) return;

    if (!user || !token) {
      setNotice('Sign in is required to place an order.');
      setCheckoutOpen(false);
      setPendingCheckout(true);
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customer,
          items: cart.map(item => ({ productId: item._id, quantity: item.quantity }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Order could not be placed.');

      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);

      if (!user.address && customer.address) {
        handleUserUpdate({ ...user, address: customer.address });
      }

      setNotice(`Order placed! Order ID: ${data.order._id.slice(-8).toUpperCase()}`);
      loadProducts();
    } catch (e) {
      setNotice(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="announcement">
        <Sparkles size={14} /> CRAFTED BY HAND, ROOTED IN INDIA <span>·</span> Every craft has a story
      </div>

      <header className="header">
        <button
          className="icon-button mobile-menu"
          aria-label="Open navigation"
          onClick={() => setMobileNav(!mobileNav)}
        >
          <Menu size={21} />
        </button>

        <a href="#home" className="brand">kala<span>kart</span><i>.</i></a>

        <nav className={mobileNav ? 'nav nav-open' : 'nav'}>
          <a href="#shop" onClick={() => setMobileNav(false)}>Shop all</a>
          <a href="#featured" onClick={() => setMobileNav(false)}>Festival finds</a>
          <a href="#custom" onClick={() => setMobileNav(false)}>Custom orders</a>
          <a href="#story" onClick={() => setMobileNav(false)}>Our artisans</a>
        </nav>

        <div className="header-actions">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search products"
              placeholder="Search handmade crafts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </label>

          {user ? (
            <div className="user-nav-group">
              <button
                type="button"
                className="user-pill-btn"
                onClick={() => { setAccountInitialTab('profile'); setAccountModalOpen(true); }}
                title={`Logged in as ${user.name}`}
              >
                <span className="user-avatar-tiny">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                <span className="user-pill-name">{user.name.split(' ')[0]}</span>
              </button>

              <button
                type="button"
                className="header-text-btn orders-shortcut-btn"
                onClick={() => { setAccountInitialTab('orders'); setAccountModalOpen(true); }}
                title="View your orders"
              >
                <Package size={16} />
                <span className="hide-sm">Orders</span>
              </button>

              <button
                type="button"
                className="icon-button signout-icon-btn"
                onClick={handleSignOut}
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-nav-group">
              <button
                type="button"
                className="signin-nav-btn"
                onClick={() => { setAuthInitialMode('login'); setAuthModalOpen(true); }}
                title="Sign in or create account"
              >
                <User size={15} />
                <span>Sign in</span>
              </button>
            </div>
          )}

          <button
            className="bag-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping bag, ${cartCount} items`}
          >
            <ShoppingBag size={20} />
            <span>Bag</span>
            <b>{cartCount}</b>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> MADE WITH HERITAGE, SHARED WITH HEART
            </div>
            <h1>
              Discover India’s<br /><em>handmade</em> soul.
            </h1>
            <p>
              Meet the makers behind meaningful objects. Shop regional crafts, handmade decor and art that carries a story.
            </p>
            <a className="primary-button" href="#shop">
              Explore handmade finds <ArrowUpRight size={17} />
            </a>
            <div className="hero-foot">
              <span>01 / 03</span>
              <span className="hero-foot-line" />
              <span>Made by real hands</span>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1500&q=90"
              alt="Warm, minimal everyday living space"
            />
            <div className="image-stamp">
              <span>MADE<br />IN INDIA</span>
              <Sparkles size={18} />
            </div>
            <div className="image-caption">A little piece of heritage, made just for you.</div>
          </div>
          <div className="hero-side-note">
            CRAFT, NOT<br />MASS <span>✳</span>
          </div>
        </section>

        <section className="benefits">
          <div>
            <span className="benefit-icon">✳</span>
            <div>
              <strong>Made by skilled hands</strong>
              <small>Thoughtful craft, lasting value.</small>
            </div>
          </div>
          <div>
            <span className="benefit-icon">↗</span>
            <div>
              <strong>Rooted in regional stories</strong>
              <small>Traditions passed through generations.</small>
            </div>
          </div>
          <div>
            <span className="benefit-icon">♡</span>
            <div>
              <strong>Every purchase supports craft</strong>
              <small>Celebrate the hands behind the art.</small>
            </div>
          </div>
        </section>

        <section className="products-section" id="shop">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> CRAFTS FROM ACROSS INDIA
              </div>
              <h2>Stories worth <em>sharing.</em></h2>
            </div>
            <p>
              Discover handmade decor, regional art, textiles and gifts crafted in small batches by Indian artisans.
            </p>
          </div>

          <div className="filters">
            <div className="category-list">
              {['All', ...new Set([...categories.filter(c => c !== 'All'), ...products.map(p => p.category)])].map(category => (
                <button
                  key={category}
                  className={activeCategory === category ? 'category active' : 'category'}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <span className="result-count">{products.length} HANDMADE FINDS</span>
          </div>

          {loading ? (
            <div className="state-message">
              <LoaderCircle className="spin" /> Discovering artisan-made treasures...
            </div>
          ) : error ? (
            <div className="state-message error-state">
              <strong>We hit a small snag.</strong>
              <span>{error}</span>
              <button className="outline-button" onClick={loadProducts}>Try again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="state-message">
              <strong>No crafts found just yet.</strong>
              <span>Try another search or category.</span>
              <button
                className="outline-button"
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <article className="product-card" key={product._id}>
                  <div className="product-image-wrap">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80'}
                      alt={product.name}
                      loading="lazy"
                    />
                    <span className="product-tag">
                      {product.featured ? 'THE GOOD PICK' : (product.region || product.category).toUpperCase()}
                    </span>
                    <button
                      className="quick-add"
                      onClick={() => addToCart(product)}
                      disabled={product.stock < 1}
                    >
                      {product.stock < 1 ? 'Sold out' : <><Plus size={16} /> Add to bag</>}
                    </button>
                  </div>
                  <div className="product-meta">
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <small className="artisan-byline">By {product.artisan || 'KalaKart Artisan'} · {product.region || 'India'}</small>
                    </div>
                    <strong>{money(product.price)}</strong>
                  </div>
                  <div className="stock-note">
                    {product.stock > 0 ? `${product.stock} available` : 'Currently unavailable'}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="featured-strip" id="featured">
          <div className="featured-mark">✳</div>
          <div>
            <div className="eyebrow">FESTIVAL & GIFTING EDIT</div>
            <h2>Celebrate the season.<br /><em>Gift something handmade.</em></h2>
            <p>From festive diyas to meaningful keepsakes, find gifts with a story behind them.</p>
          </div>
          <div className="featured-picks">
            {(featured.length ? featured : products.slice(0, 3)).map((product, i) => (
              <button className="mini-pick" key={product._id} onClick={() => addToCart(product)}>
                <img src={product.image} alt="" />
                <span>
                  <small>0{i + 1} / PICK</small>
                  <strong>{product.name}</strong>
                  <b>{money(product.price)}</b>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
        </section>

        <section className="custom-section" id="custom">
          <div className="custom-intro">
            <div className="eyebrow">
              <span className="eyebrow-line" /> MADE JUST FOR YOU
            </div>
            <h2>Dream it.<br /><em>We’ll craft it.</em></h2>
            <p>
              Have a specific size, colour, motif or gift in mind? Tell us what you’re imagining and we’ll connect your idea with the right craft.
            </p>
            <div className="custom-note">
              <span>✳</span>
              <div>
                <strong>Your idea, an artisan’s skill.</strong>
                <small>Submit a request and the KalaKart team can follow up to discuss feasibility, pricing and timelines.</small>
              </div>
            </div>
          </div>

          <form className="custom-form" onSubmit={submitCustomRequest}>
            <label>
              Your name
              <input
                required
                minLength="2"
                value={customForm.name}
                onChange={e => setCustomForm({ ...customForm, name: e.target.value })}
                placeholder="How should we address you?"
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                value={customForm.email}
                onChange={e => setCustomForm({ ...customForm, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <div className="custom-form-row">
              <label>
                What would you like?
                <select
                  value={customForm.craft}
                  onChange={e => setCustomForm({ ...customForm, craft: e.target.value })}
                >
                  <option>Home decor</option>
                  <option>Painting or wall art</option>
                  <option>Textiles</option>
                  <option>Jewellery or accessories</option>
                  <option>Festive gift</option>
                  <option>Something else</option>
                </select>
              </label>
              <label>
                Estimated budget
                <select
                  value={customForm.budget}
                  onChange={e => setCustomForm({ ...customForm, budget: e.target.value })}
                >
                  <option>Under ₹1,000</option>
                  <option>₹1,000–₹3,000</option>
                  <option>₹3,000–₹5,000</option>
                  <option>₹5,000+</option>
                  <option>Flexible</option>
                </select>
              </label>
            </div>
            <label>
              Tell us your idea
              <textarea
                required
                minLength="10"
                rows="4"
                value={customForm.details}
                onChange={e => setCustomForm({ ...customForm, details: e.target.value })}
                placeholder="Colours, size, occasion, inspiration…"
              />
            </label>
            <button className="primary-button full-button" type="submit" disabled={customSubmitting}>
              {customSubmitting ? 'Sending your idea…' : 'Send custom request'} <ArrowUpRight size={16} />
            </button>
            <small className="form-footnote">Your request is saved securely in MongoDB; no payment is taken.</small>
          </form>
        </section>

        <section className="story-section" id="story">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1100&q=85"
              alt="A thoughtfully arranged boutique space"
            />
          </div>
          <div className="story-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> THE PEOPLE BEHIND THE PIECES
            </div>
            <h2>Behind every craft<br />is a maker, a place<br /><em>and a story.</em></h2>
            <p>
              KalaKart connects you with India’s living craft traditions. We celebrate the artisans, families and communities keeping regional skills alive—one handmade piece at a time.
            </p>
            <a href="#shop" className="text-link">Explore the collection <ArrowUpRight size={16} /></a>
            <div className="signature">Made with heart, in India <span>✳</span></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand">kala<span>kart</span><i>.</i></a>
        <p>Handmade in India. Stories in every piece.</p>
        <span>© {new Date().getFullYear()} KalaKart · Crafted with care</span>
      </footer>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button>
        </div>
      )}

      {cartOpen && (
        <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setCartOpen(false); }}>
          <aside className="drawer">
            <div className="drawer-header">
              <div>
                <div className="eyebrow">YOUR LITTLE HANDMADE FINDS</div>
                <h2>Your craft bag <span>({cartCount})</span></h2>
              </div>
              <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X /></button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={38} />
                <h3>Your craft bag is taking a breather.</h3>
                <p>Find a handmade treasure to bring home.</p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore handmade finds <ArrowUpRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item._id}>
                      <img src={item.image} alt="" />
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>{money(item.price)}</span>
                        <div className="quantity">
                          <button onClick={() => changeQuantity(item._id, -1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQuantity(item._id, 1)} disabled={item.quantity >= item.stock} aria-label="Increase quantity"><Plus size={13} /></button>
                        </div>
                      </div>
                      <button
                        className="remove-item"
                        onClick={() => setCart(c => c.filter(p => p._id !== item._id))}
                        aria-label={`Remove ${item.name}`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-bottom">
                  <div className="subtotal">
                    <span>Subtotal</span>
                    <strong>{money(subtotal)}</strong>
                  </div>
                  <small>Your purchase supports independent artisans.</small>
                  <button
                    className="primary-button full-button"
                    onClick={handleProceedToCheckout}
                  >
                    {user ? (
                      <>Continue to checkout <ArrowUpRight size={16} /></>
                    ) : (
                      <><Lock size={14} /> Sign in to checkout <ArrowUpRight size={16} /></>
                    )}
                  </button>
                  {!user && (
                    <small style={{ display: 'block', textAlign: 'center', marginTop: '8px', color: 'var(--muted)', fontSize: '10px' }}>
                      Account required to place and track orders
                    </small>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="overlay checkout-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setCheckoutOpen(false); }}>
          <section className="checkout-modal">
            <div className="drawer-header">
              <div>
                <div className="eyebrow">A LITTLE MORE TO MAKE IT YOURS</div>
                <h2>Checkout</h2>
              </div>
              <button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X /></button>
            </div>

            <div className="checkout-total">
              <span>Order total</span>
              <strong>{money(subtotal)}</strong>
            </div>

            {!user ? (
              <div className="checkout-auth-required">
                <div className="auth-gate-icon">
                  <Lock size={26} />
                </div>
                <h3>Sign in required to place orders</h3>
                <p>To support Indian artisans, securely store your orders, and track deliveries, please sign in or create an account.</p>
                <button
                  type="button"
                  className="primary-button full-button"
                  onClick={() => {
                    setPendingCheckout(true);
                    setCheckoutOpen(false);
                    setAuthInitialMode('login');
                    setAuthModalOpen(true);
                  }}
                >
                  Sign in / Create Account to Continue <ArrowUpRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="checkout-user-banner">
                  <div className="checkout-user-info">
                    <User size={15} />
                    <span>Ordering as <strong>{user.name}</strong> ({user.email})</span>
                  </div>
                  <button
                    type="button"
                    className="checkout-switch-user"
                    onClick={() => { setCheckoutOpen(false); setAccountInitialTab('profile'); setAccountModalOpen(true); }}
                  >
                    Edit details
                  </button>
                </div>

                <form onSubmit={placeOrder} className="checkout-form">
                  <label>
                    Full name
                    <input
                      required
                      minLength="2"
                      value={customer.name}
                      onChange={e => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </label>

                  <label>
                    Email address
                    <input
                      required
                      type="email"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    Delivery address
                    <textarea
                      required
                      minLength="8"
                      rows="3"
                      value={customer.address}
                      onChange={e => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="House / street / city / PIN code"
                    />
                  </label>

                  <div className="demo-note">Coursework demo: your order is saved in MongoDB. No payment is collected.</div>

                  <button className="primary-button full-button" type="submit" disabled={submitting}>
                    {submitting ? 'Placing order...' : 'Place your order'} {submitting ? <LoaderCircle className="spin" size={16} /> : <ArrowUpRight size={16} />}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
        apiBase={API}
      />

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        user={user}
        token={token}
        apiBase={API}
        onSignOut={handleSignOut}
        onUserUpdate={handleUserUpdate}
        initialTab={accountInitialTab}
        setNotice={setNotice}
      />
    </div>
  );
}
