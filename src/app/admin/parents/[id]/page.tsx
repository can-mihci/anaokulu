import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ViewParentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch parent with children
  const { data: parent, error } = await supabase
    .from('parents')
    .select(`
      *,
      student_parents (
        relationship_type,
        is_primary_contact,
        students (
          id,
          name,
          last_name,
          date_of_birth,
          grade_level,
          academic_year,
          status,
          has_allergies,
          allergies,
          has_special_dietary_needs,
          dietary_needs
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !parent) {
    notFound()
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link
              href="/admin/parents"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {parent.name} {parent.last_name}
            </h1>
          </div>
          <p className="text-gray-600">Veli Detayları</p>
        </div>
        <Link
          href={`/admin/parents/${parent.id}/edit`}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Düzenle</span>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Ad Soyad" value={`${parent.name} ${parent.last_name}`} />
            <InfoItem label="E-posta" value={parent.email} />
            <InfoItem label="Telefon" value={parent.phone_number} />
            <InfoItem label="Meslek" value={parent.occupation || '-'} />
          </div>
        </div>

        {/* Children */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Çocukları</h2>
            {parent.student_parents && parent.student_parents.length > 0 && (
              <span className="text-sm text-gray-600">
                {parent.student_parents.length} öğrenci
              </span>
            )}
          </div>

          {parent.student_parents && parent.student_parents.length > 0 ? (
            <div className="space-y-4">
              {parent.student_parents.map((sp: any) => {
                const student = sp.students
                const getStatusBadge = (status: string) => {
                  const badges = {
                    active: 'bg-green-100 text-green-800',
                    inactive: 'bg-gray-100 text-gray-800',
                    graduated: 'bg-purple-100 text-purple-800',
                  }
                  const labels = {
                    active: 'Aktif',
                    inactive: 'Pasif',
                    graduated: 'Mezun',
                  }
                  return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] }
                }
                const statusBadge = getStatusBadge(student.status)

                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-lg">
                          {student.name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {student.name} {student.last_name}
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500">
                              {sp.relationship_type === 'mother' ? 'Anne' :
                               sp.relationship_type === 'father' ? 'Baba' :
                               sp.relationship_type === 'guardian' ? 'Vasi' : 'Diğer'}
                            </span>
                            {sp.is_primary_contact && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                Birincil İletişim
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.class}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-gray-100">
                      <InfoItem 
                        label="Doğum Tarihi" 
                        value={new Date(student.date_of_birth).toLocaleDateString('tr-TR')} 
                      />
                      <InfoItem 
                        label="Sınıf" 
                        value={`${student.grade_level}. Sınıf`} 
                      />
                      <InfoItem 
                        label="Akademik Yıl" 
                        value={student.academic_year} 
                      />
                    </div>

                    {/* Health alerts */}
                    {(student.has_allergies || student.has_special_dietary_needs) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-2">Önemli Sağlık Bilgileri:</p>
                        <div className="space-y-1">
                          {student.has_allergies && student.allergies && (
                            <div className="flex items-start space-x-2 text-xs">
                              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="text-red-700">
                                <strong>Alerji:</strong> {student.allergies.join(', ')}
                              </span>
                            </div>
                          )}
                          {student.has_special_dietary_needs && student.dietary_needs && (
                            <div className="flex items-start space-x-2 text-xs">
                              <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-orange-700">
                                <strong>Özel Beslenme:</strong> {student.dietary_needs.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
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
              <p className="text-gray-500 mb-4">Bu veliye bağlı öğrenci yok</p>
              <Link
                href={`/admin/parents/${parent.id}/edit`}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Öğrenci Bağla
              </Link>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hesap Bilgileri</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">
                Giriş hesabı aktif • <span className="text-gray-500">{parent.email}</span>
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500">
                Kayıt tarihi: {new Date(parent.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  )
}