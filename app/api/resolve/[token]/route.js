import { createClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  const { token } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: tokenData, error: tokenError } = await supabase
    .from('tokens')
    .select('user_id, active')
    .eq('token', token)
    .single()
  if (tokenError || !tokenData) {
    return Response.json({ error: 'Invalid token' }, { status: 404 })
  }

  if (!tokenData.active) {
    return Response.json({ error: 'Token revoked' }, { status: 403 })
  }

  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .select('full_name, street, city, state, zip, country')
    .eq('user_id', tokenData.user_id)
    .single()

  if (addressError || !address) {
    return Response.json({ error: 'No address found' }, { status: 404 })
  }

  return Response.json({ address })
}
