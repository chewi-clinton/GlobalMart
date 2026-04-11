import { useState } from 'react'
import '../styles/AdminPages.css'

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

  const statusConfig = (status) => {
    if (status === 'In Stock') return { bg: '#e6f4ea', color: '#007600' }
    if (status === 'Low Stock') return { bg: '#fff8e1', color: '#e47911' }
    return { bg: '#fce8e6', color: '#cc0c39' }
  }

  return (
    <div className="ap">

      {/* Page Title */}
      <div className="ap__header">
        <h2 className="ap__title">Warehouse Admin</h2>
      </div>

      {/* Summary Cards */}
      <div className="ap__cards">
        {[
          { label: 'Total Products', value: totalProducts, icon: '', color: '#1a73e8' },
          { label: 'Low Stock', value: lowStock, icon: '', color: '#e47911' },
          { label: 'Out of Stock', value: outOfStock, icon: '', color: '#cc0c39' },
        ].map((card) => (
          <div key={card.label} className="ap__card">
            <span className="ap__card-icon" style={{ color: card.color }}>{card.icon}</span>
            <div>
              <p className="ap__card-label">{card.label}</p>
              <p className="ap__card-value" style={{ color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Add Button */}
      <div className="ap__toolbar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ap__search"
        />
        <button
          className="ap__btn ap__btn--primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="ap__form">
          <h3 className="ap__form-title">Add New Product</h3>
          <div className="ap__form-grid">
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
                className="ap__input"
              />
            ))}
            <select
              value={newProduct.status}
              onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
              className="ap__input"
            >
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="ap__form-actions">
            <button className="ap__btn ap__btn--primary" onClick={handleAdd}>
              Save Product
            </button>
            <button
              className="ap__btn ap__btn--secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="ap__table-wrapper">
        <table className="ap__table">
          <thead>
            <tr>
              {['#', 'Product Name', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, index) => {
              const sc = statusConfig(product.status)
              return (
                <tr key={product.id}>
                  <td className="ap__td-muted">{index + 1}</td>
                  <td className="ap__td-bold">{product.name}</td>
                  <td className="ap__td-muted">{product.category}</td>
                  <td>{product.stock}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span
                      className="ap__badge"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="ap__action-btn ap__action-btn--delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WarehouseAdmin