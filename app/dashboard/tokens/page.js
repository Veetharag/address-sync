'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Tokens() {
  const [user, setUser] = useState(null)
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [label, setLabel] = useState('')
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
      await loadTokens(user)
      setLoading(false)
    }    loadData()
  }, [])

  async function loadTokens(u) {
    const { data } = await supabase
      .from('tokens')
      .select('*')
      .eq('user_id', u.id)
      .order('created_at', { ascending: false })
    setTokens(data || [])
  }

  async function handleCreate() {
    setCreating(true)
    const token = crypto.randomUUID()
    const { error } = await supabase
      .from('tokens')
      .insert({ user_id: user.id, token, label: label || 'Untitled' })
    if (!error) {
      setLabel('')
      await loadTokens(user)
    }
    setCreating(false)
  }

  async function handleRevoke(tokenId) {
    await supabase.from('tokens').delete().eq('id', tokenId)
    await loadTokens(user)
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
          <h1 className="text-2xl font-bold text-gray-800">Merchant Tokens</h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-black">
            Back
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Generate New Token</h2>
          <p className="text-sm text-gray-400 mb-4">Give each merchant their own token. They use it to fetch your current address at fulfillment time.</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Label (e.g. Amazon, Netflix)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Generate'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Active Tokens</h2>
          {tokens.length === 0 ? (
            <p className="text-gray-400 text-sm">No tokens yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {tokens.map((t) => (
                <div key={t.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-700 text-sm">{t.label}</span>
                    <button
                      onClick={() => handleRevoke(t.id)}
                      className="text-red-400 text-xs hover:text-red-600"
                    >
                      Revoke
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 font-mono break-all mb-2">{t.token}</p>
                  <p className="text-xs text-blue-500 break-all">
                    {window.location.origin}/api/resolve/{t.token}
                  </p>
                </div>
              ))}            </div>
          )}
        </div>
      </div>
    </main>
  )
}
