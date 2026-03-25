import { useState } from 'react'

const initialOrders = [

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

  const statusColor = (status) => {
    if (status === 'Delivered') return '#00c853'
    if (status === 'Shipped') return '#2196f3'
    if (status === 'Pending') return '#ff9900'
    return '#ff1744'
  }

  return (
    <div>
      <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#ff9900', fontSize: '28px', marginBottom: '24px', marginLeft: '10px' }}>
         Customer & Order Admin
      </h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Orders', value: totalOrders, color: '#ff9900' },
          { label: 'Pending', value: pending, color: '#ffaa00' },
          { label: 'Delivered', value: delivered, color: '#00c853' },
          { label: 'Cancelled', value: cancelled, color: '#ff1744' },
        ].map((card) => (
          <div key={card.label} style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${card.color}`,
            borderRadius: '10px',
            padding: '20px 30px',
            minWidth: '140px',
            textAlign: 'center',
            marginLeft: '10px',
          }}>
            <p style={{ color: '#ffffff', opacity: 0.6, fontSize: '13px' }}>{card.label}</p>
            <h2 style={{ color: card.color, fontSize: '32px', fontFamily: '"Playfair Display", Georgia, serif' }}>{card.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by customer, order ID or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #ff9900',
            backgroundColor: '#ffffff',
            color: '#ffffff',
            fontSize: '14px',
            width: '320px',
            marginLeft: '10px',
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '98.5%', borderCollapse: 'collapse', fontSize: '14px', marginLeft: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#ffffff', color: '#ff9900',border:'none' }}>
              {['Order ID', 'Customer', 'Product', 'Date', 'Amount', 'Status', 'Update Status'].map(col => (
                <th key={col} style={{ padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid #333' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} style={{ borderbottom: '1px solid #0a0a0a' }}>
                <td style={{ padding: '14px 16px', color: '#0a0a0a', fontWeight: '600' }}>{order.id}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a', fontWeight: '500' }}>{order.customer}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a' }}>{order.product}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a' }}>{order.date}</td>
                <td style={{ padding: '14px 16px', color: '#0a0a0a' }}>${order.amount.toFixed(2)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    backgroundColor: statusColor(order.status) + '22',
                    color: statusColor(order.status),
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#ff9900',
                      color: '#ffffff',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CustomerOrderAdmin