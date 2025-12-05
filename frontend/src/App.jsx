import { useEffect, useState } from 'react';
import { API_BASE } from './api';

import AuthPanel from './components/AuthPanel';
import CreateProductForm from './components/CreateProductForm';
import ProductList from './components/ProductList';
import SortBar from './components/SortBar';
import MessagesPanel from './components/MessagesPanel';

function App() {
  // Auth state
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Current user / token
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [focusedKeyword, setFocusedKeyword] = useState('');

  // New product
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newProdLoading, setNewProdLoading] = useState(false);
  const [newProdError, setNewProdError] = useState('');
  const [newProdMessage, setNewProdMessage] = useState('');

  // Editing product
  const [editingProduct, setEditingProduct] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Messages
  const [activeMessageProduct, setActiveMessageProduct] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [messageError, setMessageError] = useState('');

  // Load products on mount
  useEffect(() => {
    fetchProducts(sortOrder);
  }, []);

  async function fetchProducts(sort = 'default') {
    try {
      setProductsLoading(true);

      const params = new URLSearchParams();
      if (sort && sort !== 'default') {
        params.append('sort', sort);
      }

      const url = params.toString()
        ? `${API_BASE}/api/products?${params.toString()}`
        : `${API_BASE}/api/products`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setProductsLoading(false);
    }
  }

  // Login / register
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setAuthLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch(`${API_BASE}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.message || 'Registration failed');
        } else {
          setAuthMessage(
            'Registration successful. Please log in with this account.'
          );
          setMode('login');
        }
      } else {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.message || 'Login failed');
        } else {
          setAuthMessage('Login successful');
          setToken(data.token);
          const userInfo = {
            email: data.email,
            role: data.role,
            id: data.userId,
          };
          setCurrentUser(userInfo);
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify(userInfo));
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError('Request error. Please try again later.');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setAuthMessage('Logged out');
  }

  // Create product
  async function handleCreateProduct(e) {
    e.preventDefault();
    setNewProdError('');
    setNewProdMessage('');

    if (!currentUser || currentUser.role !== 'seller') {
      setNewProdError('You must log in as a seller to create products.');
      return;
    }
    if (!token) {
      setNewProdError('Missing auth token. Please log in again.');
      return;
    }
    if (!newTitle || !newPrice) {
      setNewProdError('Title and price are required.');
      return;
    }

    const priceNumber = parseFloat(newPrice);
    if (Number.isNaN(priceNumber)) {
      setNewProdError('Price must be a number.');
      return;
    }

    try {
      setNewProdLoading(true);
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          price: priceNumber,
          image_url: newImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNewProdError(data.message || 'Failed to create product.');
      } else {
        setNewProdMessage('Product created successfully.');
        setNewTitle('');
        setNewDescription('');
        setNewPrice('');
        setNewImageUrl('');
        fetchProducts(sortOrder);
      }
    } catch (err) {
      console.error(err);
      setNewProdError('Request error. Please try again later.');
    } finally {
      setNewProdLoading(false);
    }
  }

  function handleSortChange(e) {
    const value = e.target.value;
    setSortOrder(value);
    fetchProducts(value);
  }

  function handleFocusKeyword(rawTitle) {
    const parts = rawTitle.split(' ').filter(Boolean);
    let keyword = rawTitle;
    if (parts.length >= 2) {
      keyword = parts[1];
    }
    setFocusedKeyword(keyword);
  }

  let finalProducts = [...products];
  if (focusedKeyword) {
    const kw = focusedKeyword.toLowerCase().trim();
    if (kw.length > 0) {
      finalProducts.sort((a, b) => {
        const aMatch =
          (a.title && a.title.toLowerCase().includes(kw)) ||
          (a.description && a.description.toLowerCase().includes(kw));
        const bMatch =
          (b.title && b.title.toLowerCase().includes(kw)) ||
          (b.description && b.description.toLowerCase().includes(kw));

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }
  }

  function startEditProduct(product) {
    setEditingProduct(product);
    setEditTitle(product.title || '');
    setEditDescription(product.description || '');
    setEditPrice(String(product.price ?? ''));
    setEditImageUrl(product.image_url || '');
    setEditError('');
    setEditMessage('');
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();
    setEditError('');
    setEditMessage('');

    if (!editingProduct) return;

    if (!currentUser || currentUser.role !== 'seller') {
      setEditError('You must be a seller to update products.');
      return;
    }
    if (!token) {
      setEditError('Missing auth token. Please log in again.');
      return;
    }

    if (!editTitle || !editPrice) {
      setEditError('Title and price are required.');
      return;
    }

    const priceNumber = parseFloat(editPrice);
    if (Number.isNaN(priceNumber)) {
      setEditError('Price must be a number.');
      return;
    }

    try {
      setEditLoading(true);
      const res = await fetch(
        `${API_BASE}/api/products/${editingProduct.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            price: priceNumber,
            image_url: editImageUrl,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.message || 'Failed to update product.');
      } else {
        setEditMessage('Product updated successfully.');
        setEditingProduct(null);
        fetchProducts(sortOrder);
      }
    } catch (err) {
      console.error(err);
      setEditError('Request error. Please try again later.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeleteProduct(productId) {
    if (!currentUser || currentUser.role !== 'seller') {
      alert('You must log in as a seller to delete products.');
      return;
    }
    if (!token) {
      alert('Missing auth token. Please log in again.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to delete product.');
      } else {
        if (editingProduct && editingProduct.id === productId) {
          setEditingProduct(null);
        }
        fetchProducts(sortOrder);
      }
    } catch (err) {
      console.error(err);
      alert('Request error. Please try again later.');
    }
  }

  async function openMessagesForProduct(product) {
    if (!currentUser) {
      alert('Please log in to view messages.');
      return;
    }

    setActiveMessageProduct(product);
    setMessages([]);
    setNewMessageContent('');
    setMessageError('');
    setMessagesLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/messages?productId=${product.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessageError(data.message || 'Failed to load messages.');
      } else {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
      setMessageError('Request error while loading messages.');
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!currentUser) {
      setMessageError('Please log in first.');
      return;
    }
    if (!token) {
      setMessageError('Missing auth token. Please log in again.');
      return;
    }
    if (!activeMessageProduct) {
      setMessageError('No product selected.');
      return;
    }
    if (!newMessageContent.trim()) {
      setMessageError('Message content cannot be empty.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: activeMessageProduct.id,
          content: newMessageContent.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessageError(data.message || 'Failed to send message.');
      } else {
        setNewMessageContent('');
        setMessageError('');
        openMessagesForProduct(activeMessageProduct);
      }
    } catch (err) {
      console.error(err);
      setMessageError('Request error while sending message.');
    }
  }

  async function handlePurchase(product) {
    if (!currentUser || currentUser.role !== 'buyer') {
      alert('You must log in as a buyer to purchase.');
      return;
    }
    if (!token) {
      alert('Missing auth token. Please log in again.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/purchases`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Purchase failed.');
      } else {
        alert('Purchase successful.');
        fetchProducts(sortOrder);
      }
    } catch (err) {
      console.error(err);
      alert('Request error. Please try again later.');
    }
  }

  //Web page structure
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        backgroundImage: 'url("/farm.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 16px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h1 style={{ fontSize: '40px', marginBottom: '8px', color: '#1f2933' }}>
          Local Farm Market
        </h1>
        <p style={{ color: '#374151', marginBottom: '24px' }}>
          A small marketplace app connecting local farmers and community buyers
          (Course Project).
        </p>

        {/* Status bar */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(243, 244, 246, 0.9)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {currentUser ? (
            <>
              <div>
                <strong>Logged in:</strong> {currentUser.email} (role:{' '}
                {currentUser.role})
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <div>Not logged in</div>
          )}
        </div>

        {/* Auth panel: hidden when logged in */}
        {!currentUser && (
          <AuthPanel
            mode={mode}
            setMode={setMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            role={role}
            setRole={setRole}
            authError={authError}
            authMessage={authMessage}
            authLoading={authLoading}
            onSubmit={handleAuthSubmit}
          />
        )}

        {/* Create product (seller only) */}
        {currentUser && currentUser.role === 'seller' && (
          <CreateProductForm
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newDescription={newDescription}
            setNewDescription={setNewDescription}
            newPrice={newPrice}
            setNewPrice={setNewPrice}
            newImageUrl={newImageUrl}
            setNewImageUrl={setNewImageUrl}
            newProdError={newProdError}
            newProdMessage={newProdMessage}
            newProdLoading={newProdLoading}
            onSubmit={handleCreateProduct}
          />
        )}

        {/* Edit product panel */}
        {currentUser && currentUser.role === 'seller' && editingProduct && (
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              marginBottom: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <h2 style={{ marginBottom: '8px' }}>
              Edit Product (ID: {editingProduct.id})
            </h2>
            <form onSubmit={handleUpdateProduct}>
              <div style={{ marginBottom: '8px' }}>
                <label>
                  Title:
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    style={{
                      marginLeft: '8px',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      minWidth: '260px',
                    }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label>
                  Description:
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{
                      marginLeft: '8px',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      minWidth: '260px',
                    }}
                  />
                </label>
              </div>
<div style={{ marginBottom: '8px' }}>
                <label>
                  Price:
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    style={{
                      marginLeft: '8px',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      minWidth: '120px',
                    }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label>
                  Image URL:
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    style={{
                      marginLeft: '8px',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      minWidth: '260px',
                    }}
                  />
                </label>
              </div>

              {editError && (
                <div style={{ color: 'red', marginBottom: '8px' }}>
                  {editError}
                </div>
              )}
              {editMessage && (
                <div style={{ color: 'green', marginBottom: '8px' }}>
                  {editMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={editLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  cursor: 'pointer',
                  marginRight: '8px',
                }}
              >
                {editLoading ? 'Updating...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Sort bar */}
        <SortBar
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          focusedKeyword={focusedKeyword}
          onClearKeyword={() => setFocusedKeyword('')}
        />

        {/* Messages panel */}
        <MessagesPanel
          activeProduct={activeMessageProduct}
          messages={messages}
          messagesLoading={messagesLoading}
          messageError={messageError}
          currentUser={currentUser}
          newMessageContent={newMessageContent}
          setNewMessageContent={setNewMessageContent}
          onClose={() => {
            setActiveMessageProduct(null);
            setMessages([]);
            setNewMessageContent('');
            setMessageError('');
          }}
          onSend={handleSendMessage}
        />

        {/* Product list */}
        <ProductList
          products={finalProducts}
          loading={productsLoading}
          onFocusKeyword={handleFocusKeyword}
          currentUser={currentUser}
          onEditProduct={startEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onOpenMessages={openMessagesForProduct}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
}

export default App;