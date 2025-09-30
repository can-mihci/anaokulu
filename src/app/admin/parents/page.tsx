import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'

export default async function ParentsPage() {
  const supabase = await createClient()
  
  // Fetch all parents with their children
  const { data: parents, error } = await supabase
    .from('parents')
    .select(`
      *,
      student_parents (
        student_id,
        relationship_type,
        is_primary_contact,
        students (
          id,
          name,
          last_name
        )
      )
    `)
    .order('last_name', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veliler</h1>
          <p className="text-gray-600 mt-1">
            Tüm velileri görüntüleyin ve yönetin
          </p>
        </div>
        <Link
          href="/admin/parents/new"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Yeni Veli Ekle</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Toplam Veli"
          value={parents?.length || 0}
          color="bg-green-500"
        />
        <StatCard
          label="Bağlı Öğrenci Sayısı"
          value={parents?.reduce((acc, p) => acc + (p.student_parents?.length || 0), 0) || 0}
          color="bg-blue-500"
        />
        <StatCard
          label="Bağlantısız Veli"
          value={parents?.filter(p => !p.student_parents || p.student_parents.length === 0).length || 0}
          color="bg-orange-500"
        />
      </div>

      {/* Parents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600">
            Hata: Veliler yüklenirken bir sorun oluştu
          </div>
        ) : !parents || parents.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz veli yok
            </h3>
            <p className="text-gray-600 mb-4">
              Yeni veli ekleyerek başlayın
            </p>
            <Link
              href="/admin/parents/new"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              İlk Veliyi Ekle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meslek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Çocukları
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                          {parent.name[0]}{parent.last_name[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parent.name} {parent.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {parent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.occupation || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {parent.student_parents && parent.student_parents.length > 0 ? (
                        <div className="text-sm">
                          {parent.student_parents.map((sp: any) => (
                            <div key={sp.student_id} className="mb-1">
                              <span className="text-gray-900">
                                {sp.students?.name} {sp.students?.last_name}
                              </span>
                              <span className="text-gray-500 text-xs ml-2">
                                ({sp.relationship_type === 'mother' ? 'Anne' : 
                                  sp.relationship_type === 'father' ? 'Baba' : 
                                  sp.relationship_type === 'guardian' ? 'Vasi' : 'Diğer'})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Bağlı öğrenci yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/parents/${parent.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Görüntüle
                      </Link>
                      <Link
                        href={`/admin/parents/${parent.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4`}>
          {value}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}