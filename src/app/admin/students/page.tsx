import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'

export default async function StudentsPage() {
  const supabase = await createClient()
  
  // Fetch all students
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('last_name', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Öğrenciler</h1>
          <p className="text-gray-600 mt-1">
            Tüm öğrencileri görüntüleyin ve yönetin
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Yeni Öğrenci Ekle</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Toplam Öğrenci"
          value={students?.length || 0}
          color="bg-blue-500"
        />
        <StatCard
          label="Aktif Öğrenci"
          value={students?.filter(s => s.status === 'active').length || 0}
          color="bg-green-500"
        />
        <StatCard
          label="Mezun Olmuş"
          value={students?.filter(s => s.status === 'graduated').length || 0}
          color="bg-purple-500"
        />
        <StatCard
          label="Pasif Öğrenci"
          value={students?.filter(s => s.status === 'inactive').length || 0}
          color="bg-gray-500"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600">
            Hata: Öğrenciler yüklenirken bir sorun oluştu
          </div>
        ) : !students || students.length === 0 ? (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz öğrenci yok
            </h3>
            <p className="text-gray-600 mb-4">
              Yeni öğrenci ekleyerek başlayın
            </p>
            <Link
              href="/admin/students/new"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              İlk Öğrenciyi Ekle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Öğrenci
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TC Kimlik No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sınıf
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akademik Yıl
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {student.name[0]}{student.last_name[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(student.date_of_birth).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.national_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.grade_level}. Sınıf
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.academic_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : student.status === 'graduated'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {student.status === 'active'
                          ? 'Aktif'
                          : student.status === 'graduated'
                          ? 'Mezun'
                          : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Görüntüle
                      </Link>
                      <Link
                        href={`/admin/students/${student.id}/edit`}
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