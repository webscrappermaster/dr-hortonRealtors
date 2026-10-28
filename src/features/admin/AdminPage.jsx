import { useState, useEffect } from 'react'
import AdminLogin from './components/AdminLogin'
import AdminPanel from './components/AdminPanel'

// noindex cubierto por X-Robots-Tag global en vercel.json
function AdminPage() {
  const [status, setStatus] = useState('checking') // 'checking' | 'login' | 'panel'

  useEffect(() => {
    fetch('/api/admin/session')
      .then(r => r.json())
      .then(data => setStatus(data.authenticated ? 'panel' : 'login'))
      .catch(() => setStatus('login'))
  }, [])

  if (status === 'checking') return null

  if (status === 'login') {
    return <AdminLogin onSuccess={() => setStatus('panel')} />
  }

  return <AdminPanel onLogout={() => setStatus('login')} />
}

export default AdminPage
