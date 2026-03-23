'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }      setUser(user)
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setAddress(data)
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
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
          <h1 className="text-2xl font-bold text-gray-800">AddressSync</h1>
          <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-black">
            Sign out
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Logged in as</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Shipping Address</h2>
          {address ? (
            <div className="text-gray-600 text-sm space-y-1">
              <p>{address.full_name}</p>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.zip}</p>
              <p>{address.country}</p>
              <button
                onClick={() => router.push('/dashboard/edit')}
                className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
              >
                Edit Address
              </button>
            </div>          ) : (
            <div>
              <p className="text-gray-400 text-sm mb-4">No address saved yet.</p>
              <button
                onClick={() => router.push('/dashboard/edit')}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
              >
                Add Address
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Merchant Tokens</h2>
          <p className="text-gray-400 text-sm mb-4">Generate secure tokens for merchants to fetch your address at fulfillment time.</p>
          <button
            onClick={() => router.push('/dashboard/tokens')}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            Manage Tokens
          </button>
        </div>
      </div>
    </main>
  )
}
