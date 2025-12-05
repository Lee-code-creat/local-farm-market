export default function CreateProductForm({
  newTitle,
  setNewTitle,
  newDescription,
  setNewDescription,
  newPrice,
  setNewPrice,
  newImageUrl,
  setNewImageUrl,
  newProdError,
  newProdMessage,
  newProdLoading,
  onSubmit,
}) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <h2 style={{ marginBottom: '8px' }}>Create Product (Seller Only)</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label>
            Title:
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
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
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
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
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
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
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="/fruits/apple1.png"
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

        {newProdError && (
          <div style={{ color: 'red', marginBottom: '8px' }}>{newProdError}</div>
        )}
        {newProdMessage && (
          <div style={{ color: 'green', marginBottom: '8px' }}>
            {newProdMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={newProdLoading}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#10b981',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          {newProdLoading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}