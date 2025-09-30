import { redirect } from 'next/navigation'
import { getUserRole, getUserProfile } from '../lib/auth'
import AdminNav from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getUserRole()
  const profile = await getUserProfile()

  // Redirect if not admin
  if (role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav profile={profile} />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}