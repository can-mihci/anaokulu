import { createClient as createServerClient } from './supabase/server'
import { UserRole } from './supabase/client'

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createServerClient()
  const user = await getCurrentUser()
  
  if (!user) return null

  // Check if user is admin
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (admin) return 'admin'

  // Check if user is teacher
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (teacher) return 'teacher'

  // Check if user is parent
  const { data: parent } = await supabase
    .from('parents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (parent) return 'parent'

  return null
}

export async function getUserProfile() {
  const supabase = await createServerClient()
  const user = await getCurrentUser()
  const role = await getUserRole()
  
  if (!user || !role) return null

  let profile = null

  if (role === 'admin') {
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
    profile = data
  } else if (role === 'teacher') {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
    profile = data
  } else if (role === 'parent') {
    const { data } = await supabase
      .from('parents')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
    profile = data
  }

  return {
    user,
    role,
    profile
  }
}