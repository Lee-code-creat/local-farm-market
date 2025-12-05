export default function AuthPanel({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  authError,
  authMessage,
  authLoading,
  onSubmit,
}) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        marginBottom: '32px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setMode('login')}
          style={{
            padding: '6px 12px',
            marginRight: '8px',
            borderRadius: '6px',
            border: mode === 'login' ? '2px solid #1f2937' : '1px solid #d1d5db',
            backgroundColor: mode === 'login' ? '#1f2937' : '#ffffff',
            color: mode === 'login' ? '#ffffff' : '#111827',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: mode === 'register' ? '2px solid #1f2937' : '1px solid #d1d5db',
            backgroundColor: mode === 'register' ? '#1f2937' : '#ffffff',
            color: mode === 'register' ? '#ffffff' : '#111827',
            cursor: 'pointer',
          }}
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {mode === 'register' && (
          <div style={{ marginBottom: '8px' }}>
            <label>
              Role:
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  marginLeft: '8px',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                }}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </label>
          </div>
        )}

        {authError && (
          <div style={{ color: 'red', marginBottom: '8px' }}>{authError}</div>
        )}
        {authMessage && (
          <div style={{ color: 'green', marginBottom: '8px' }}>{authMessage}</div>
        )}

        <button
          type="submit"
          disabled={authLoading}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          {authLoading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
}