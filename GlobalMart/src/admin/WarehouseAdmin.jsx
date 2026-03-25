import { useState } from 'react'

const initialProducts = [
 { id: 1, name: 'Wireless Headphones', category: 'Electronics', stock: 120, price: 59.99, status: 'In Stock' },
  { id: 2, name: 'Running Shoes', category: 'Footwear', stock: 8, price: 89.99, status: 'Low Stock' },
  { id: 3, name: 'Coffee Maker', category: 'Appliances', stock: 0, price: 45.00, status: 'Out of Stock' },
  { id: 4, name: 'Yoga Mat', category: 'Sports', stock: 55, price: 25.00, status: 'In Stock' },
  { id: 5, name: 'Smartphone Case', category: 'Accessories', stock: 5, price: 12.99, status: 'Low Stock' },
]

function WarehouseAdmin() {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', stock: '', price: '', status: 'In Stock'
  })

  const totalProducts = products.length
  const lowStock = products.filter(p => p.status === 'Low Stock').length
  const outOfStock = products.filter(p => p.status === 'Out of Stock').length

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.stock || !newProduct.price) return
    const product = {
      id: products.length + 1,
      ...newProduct,
      stock: parseInt(newProduct.stock),
      price: parseFloat(newProduct.price),
    }
    setProducts([...products, product])
    setNewProduct({ name: '', category: '', stock: '', price: '', status: 'In Stock' })
    setShowForm(false)
  }

  const statusColor = (status) => {
    if (status === 'In Stock') return '#00c853'
    if (status === 'Low Stock') return '#ff9900'
    return '#ff1744'
  }

  return (
    <div>
      <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', marginLeft: '10px',color: '#ff9900', fontSize: '28px', marginBottom: '24px' }}>
        Warehouse Admin
      </h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Products', value: totalProducts, color: '#ff9900' },
          { label: 'Low Stock', value: lowStock, color: '#ffaa00' },
          { label: 'Out of Stock', value: outOfStock, color: '#ff1744' },
        ].map((card) => (
          <div key={card.label} style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${card.color}`,
            borderRadius: '10px',
            padding: '20px 30px',
            minWidth: '160px',
            textAlign: 'center',
            marginLeft: '10px',
          }}>
            <p style={{ color: '#ffffff', opacity: 0.6, fontSize: '13px' }}>{card.label}</p>
            <h2 style={{ color: card.color, fontSize: '32px', fontFamily: '"Playfair Display", Georgia, serif' }}>{card.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #ff9900',
            backgroundColor: '#ffffff',
            color: '#0a0a0a',
            fontSize: '14px',
            width: '260px',
            marginLeft: '10px',
          }}
        />
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff9900',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
            marginRight: '10px',
          }}
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'flex-end',
        }}>
          {[
            { placeholder: 'Product Name', key: 'name' },
            { placeholder: 'Category', key: 'category' },
            { placeholder: 'Stock Quantity', key: 'stock' },
            { placeholder: 'Price ($)', key: 'price' },
          ].map((field) => (
            <input
              key={field.key}
              type="text"
              placeholder={field.placeholder}
              value={newProduct[field.key]}
              onChange={(e) => setNewProduct({ ...newProduct, [field.key]: e.target.value })}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ff9900',
                backgroundColor: '#ffffff',
                color: '#ffffff',
                fontSize: '14px',
                width: '180px',
              }}
            />
          ))}
          <select
            value={newProduct.status}
            onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ff9900',
              backgroundColor: '#ffffff',
              color: '#0a0a0a',
              fontSize: '14px',
            }}
          >
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
          <button
            onClick={handleAdd}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9900',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '98.5%', borderCollapse: 'collapse', fontSize: '14px', marginLeft: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#ffffff', color: '#ff9900' }}>
              {['#', 'Product Name', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid #333' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, index) => (
              <tr key={product.id} style={{ borderBottom: 'none' }}>
                <td style={{ padding: '14px 16px', color: '#0a0a0a' }}>{index + 1}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a', fontWeight: '500' }}>{product.name}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a' }}>{product.category}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a' }}>{product.stock}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a' }}>${product.price.toFixed(2)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    backgroundColor: statusColor(product.status) + '22',
                    color: statusColor(product.status),
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {product.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#ff9900',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WarehouseAdmin