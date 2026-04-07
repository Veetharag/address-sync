'use client'

import { useState, useEffect, useRef } from 'react'
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
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  })
  const containerRef = useRef(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).single()
      if (data) {
        setForm({ full_name: data.full_name, street: data.street, city: data.city, state: data.state, zip: data.zip, country: data.country })
      }
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (loading || !containerRef.current) return
    async function init() {
      if (!window.google) {
        await new Promise((resolve) => {
          const s = document.createElement('script')
          s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=beta&libraries=places`
          s.async = true
          s.onload = resolve
          document.head.appendChild(s)
        })
      }
      const { PlaceAutocompleteElement } = await window.google.maps.importLibrary('places')
      const el = new PlaceAutocompleteElement({ componentRestrictions: { country: 'us' }, types: ['address'] })
      el.style.cssText = 'width:100%;'
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(el)
      el.addEventListener('gmp-select', async ({ placePrediction }) => {
        const place = placePrediction.toPlace()
        await place.fetchFields({ fields: ['addressComponents'] })
        let streetNumber = '', route = '', city = '', state = '', zip = ''
        place.addressComponents.forEach(c => {
          if (c.types.includes('street_number')) streetNumber = c.longText
          if (c.types.includes('route')) route = c.longText
          if (c.types.includes('locality')) city = c.longText
          if (c.types.includes('administrative_area_level_1')) state = c.shortText
          if (c.types.includes('postal_code')) zip = c.longText
        })
        setForm(prev => ({ ...prev, street: `${streetNumber} ${route}`.trim(), city, state, zip, country: 'US' }))
      })
    }
    init()
  }, [loading])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const validationRes = await fetch('/api/validate-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const validation = await validationRes.json()

    if (!validation.valid) {
      setError(validation.message)
      setSaving(false)
      return
    }

    const finalForm = { ...form, ...validation.standardized }

    const { error } = await supabase.from('addresses').upsert({ ...finalForm, user_id: user.id }, { onConflict: 'user_id' })
    if (error) { setError(error.message); setSaving(false) }
    else router.push('/dashboard')
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></main>

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Edit Address</h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-black">Cancel</button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" required />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Street Address</label>
              <div ref={containerRef} className="w-full rounded-lg text-sm" />
              {form.street && <p className="text-xs text-gray-500 mt-1"><div>
  <label className="text-sm text-gray-600 mb-1 block">Street Address</label>
  <div ref={containerRef} className="w-full rounded-lg text-sm" />
  {form.street && <p className="text-xs text-gray-500 mt-1">Selected: {form.street}</p>}
</div>
<div>
  <label className="text-sm text-gray-600 mb-1 block">Apt, Suite, Unit <span className="text-gray-400">(optional)</span></label>
  <input
    type="text"
    value={form.street2 || ''}
    onChange={(e) => setForm({...form, street2: e.target.value})}
    placeholder="Apt 4B, Suite 100, Unit 2..."
    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
  />
</div></p>}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-600 mb-1 block">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div className="w-24">
                <label className="text-sm text-gray-600 mb-1 block">State</label>
                <input type="text" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div className="w-28">
                <label className="text-sm text-gray-600 mb-1 block">ZIP</label>
                <input type="text" value={form.zip} onChange={(e) => setForm({...form, zip: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Country</label>
              <input type="text" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={saving} className="bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
