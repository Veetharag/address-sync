'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditAddress() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    full_name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  })
  const router = useRouter()
  const supabase = createClient()
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setForm({
          full_name: data.full_name,
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country
        })
      }
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('addresses')
      .upsert({ ...form, user_id: user.id }, { onConflict: 'user_id' })
    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Edit Address</h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-black">
            Cancel
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({...form, full_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Street Address</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm({...form, street: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />           </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-600 mb-1 block">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({...form, city: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div className="w-24">
                <label className="text-sm text-gray-600 mb-1 block">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({...form, state: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div className="w-28">
                <label className="text-sm text-gray-600 mb-1 block">ZIP</label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={(e) => setForm({...form, zip: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({...form, country: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
