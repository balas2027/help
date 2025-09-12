'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Update profile
export async function updateProfile(formData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const username = formData.get('username')
  const phone = formData.get('phone')

  // Update data only if provided
  const updates = {}
  if (username && username.trim() !== '') updates.username = username.trim()
  if (phone && phone.trim() !== '') updates.phone = phone.trim()

  if (Object.keys(updates).length === 0) {
    redirect('/profile?error=No data provided to update')
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/profile?message=Profile updated successfully')
}

// Update password
export async function updatePassword(formData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const password = formData.get('password')

  if (!password || password.length < 6) {
    redirect('/profile?error=Password must be at least 6 characters')
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/profile?message=Password updated successfully')
}

// Logout
export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login')
}