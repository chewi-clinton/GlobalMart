import { useState } from 'react'
import '../styles/AdminPages.css'

const initialOrders = [
  { id: 'ORD001', customer: 'Alice Johnson', product: 'Wireless Headphones', date: '2026-04-01', amount: 59.99, status: 'Delivered' },
  { id: 'ORD002', customer: 'Bob Smith', product: 'Running Shoes', date: '2026-04-01', amount: 89.99, status: 'Pending' },
  { id: 'ORD003', customer: 'Clara Davis', product: 'Coffee Maker', date: '2026-03-31', amount: 45.00, status: 'Shipped' },
  { id: 'ORD004', customer: 'David Lee', product: 'Yoga Mat', date: '2026-03-30', amount: 25.00, status: 'Cancelled' },
  { id: 'ORD005', customer: 'Eva Brown', product: 'Smartphone Case', date: '2026-03-29', amount: 12.99, status: 'Pending' },
]

function CustomerOrderAdmin() {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')

  const totalOrders = orders.length
  const pending = orders.filter(o => o.status === 'Pending').length
  const delivered = orders.filter(o => o.status === 'Delivered').length
  const cancelled = orders.filter(o => o.status === 'Cancelled').length

  const filtered = orders.filter(o =>
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.product.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  const statusConfig = (status) => {
    if (status === 'Delivered') return { bg: '#e6f4ea', color: '#007600' }
    if (status === 'Shipped') return { bg: '#e8f0fe', color: '#1a73e8' }
    if (status === 'Pending') return { bg: '#fff8e1', color: '#e47911' }
    return { bg: '#fce8e6', color: '#cc0c39' }
  }

  return (
    <div className="ap">

      {/* Page Title */}
      <div className="ap__header">
        <h2 className="ap__title"> Customer & Order Admin</h2>
      </div>

      {/* Summary Cards */}
      <div className="ap__cards">
        {[
          { label: 'Total Orders', value: totalOrders, icon: '', color: '#1a73e8' },
          { label: 'Pending', value: pending, icon: '', color: '#e47911' },
          { label: 'Delivered', value: delivered, icon: '', color: '#007600' },
          { label: 'Cancelled', value: cancelled, icon: '', color: '#cc0c39' },
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

      {/* Search */}
      <div className="ap__toolbar">
        <input
          type="text"
          placeholder="Search by customer, order ID or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ap__search"
        />
      </div>

      {/* Orders Table */}
      <div className="ap__table-wrapper">
        <table className="ap__table">
          <thead>
            <tr>
              {['Order ID', 'Customer', 'Product', 'Date', 'Amount', 'Status', 'Update Status'].map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const sc = statusConfig(order.status)
              return (
                <tr key={order.id}>
                  <td className="ap__td-order-id">{order.id}</td>
                  <td className="ap__td-bold">{order.customer}</td>
                  <td className="ap__td-muted">{order.product}</td>
                  <td className="ap__td-muted">{order.date}</td>
                  <td>${order.amount.toFixed(2)}</td>
                  <td>
                    <span
                      className="ap__badge"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="ap__select"
                    >
                      <option>Pending</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
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

export default CustomerOrderAdmin