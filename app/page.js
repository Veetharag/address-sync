import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AddressSync</h1>
        <p className="text-gray-500 mb-8">One address. Every subscription.</p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800">
            Log In
          </Link>
          <Link href="/signup" className="border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}