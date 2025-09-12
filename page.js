// app/profile/page.js
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProfileClient from './ProfileClient'

export default async function ProfilePage({ searchParams }) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile info from Supabase
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, phone')
    .eq('id', user.id)
    .single()

  return <ProfileClient user={user} profile={profile} searchParams={searchParams} />
}
