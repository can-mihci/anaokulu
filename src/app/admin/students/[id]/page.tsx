import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ViewStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch student with parents
  const { data: student, error } = await supabase
    .from('students')
    .select(`
      *,
      student_parents (
        relationship_type,
        is_primary_contact,
        parents (
          id,
          name,
          last_name,
          email,
          phone_number,
          occupation
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !student) {
    notFound()
  }

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
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link
              href="/admin/students"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {student.name} {student.last_name}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.class}`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="text-gray-600">Öğrenci Detayları</p>
        </div>
        <Link
          href={`/admin/students/${student.id}/edit`}
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
            <InfoItem label="Ad Soyad" value={`${student.name} ${student.last_name}`} />
            <InfoItem label="TC Kimlik No" value={student.national_id} />
            <InfoItem label="Doğum Tarihi" value={new Date(student.date_of_birth).toLocaleDateString('tr-TR')} />
            <InfoItem label="Yaş" value={calculateAge(student.date_of_birth)} />
            <InfoItem label="Sınıf Seviyesi" value={`${student.grade_level}. Sınıf`} />
            <InfoItem label="Akademik Yıl" value={student.academic_year} />
            <InfoItem label="Kayıt Tarihi" value={new Date(student.enrollment_date).toLocaleDateString('tr-TR')} />
            <InfoItem label="Durum" value={statusBadge.label} />
          </div>
        </div>

        {/* Parents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Veli Bilgileri</h2>
          {student.student_parents && student.student_parents.length > 0 ? (
            <div className="space-y-4">
              {student.student_parents.map((sp: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                        {sp.parents.name[0]}{sp.parents.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {sp.parents.name} {sp.parents.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sp.relationship_type === 'mother' ? 'Anne' :
                           sp.relationship_type === 'father' ? 'Baba' :
                           sp.relationship_type === 'guardian' ? 'Vasi' : 'Diğer'}
                          {sp.is_primary_contact && ' • Birincil İletişim'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoItem label="E-posta" value={sp.parents.email} />
                    <InfoItem label="Telefon" value={sp.parents.phone_number} />
                    {sp.parents.occupation && (
                      <InfoItem label="Meslek" value={sp.parents.occupation} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Henüz veli bağlantısı yok</p>
          )}
        </div>

        {/* Health Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sağlık Bilgileri</h2>
          <div className="space-y-4">
            <CheckItem
              label="Kronik Hastalık"
              checked={student.has_chronic_illness}
              details={student.medicines}
              detailLabel="İlaçlar"
            />
            <CheckItem
              label="Alerji"
              checked={student.has_allergies}
              details={student.allergies}
              detailLabel="Alerjiler"
            />
            <CheckItem
              label="Özel Beslenme İhtiyacı"
              checked={student.has_special_dietary_needs}
              details={student.dietary_needs}
              detailLabel="Beslenme İhtiyaçları"
            />
          </div>
        </div>

        {/* Educational Background */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Eğitim Bilgileri</h2>
          <div className="space-y-4">
            <CheckItem
              label="Tuvalet Eğitimi"
              checked={student.toilet_training_completed}
            />
            <CheckItem
              label="Daha Önce Başka Kurumda Okudu"
              checked={student.studied_elsewhere_before}
              details={student.previous_institution_name ? [student.previous_institution_name] : null}
              detailLabel="Önceki Kurum"
            />
            <CheckItem
              label="Özel Eğitim İhtiyacı"
              checked={student.has_special_educational_needs}
              details={student.special_educational_needs_details}
              detailLabel="Detaylar"
            />
          </div>
        </div>

        {/* Social & Emergency */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sosyal Bilgiler</h2>
          {student.socialization_status ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Sosyalleşme Durumu</p>
              <p className="text-gray-900">{student.socialization_status}</p>
            </div>
          ) : (
            <p className="text-gray-500">Bilgi girilmemiş</p>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Acil Durum İletişim</h3>
          {student.emergency_contact_name ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoItem label="İsim" value={student.emergency_contact_name} />
              <InfoItem label="Telefon" value={student.emergency_contact_phone || '-'} />
              <InfoItem label="Yakınlık" value={student.emergency_contact_relationship || '-'} />
            </div>
          ) : (
            <p className="text-gray-500">Veli bilgisi kullanılacak</p>
          )}
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

function CheckItem({ label, checked, details, detailLabel }: {
  label: string
  checked: boolean
  details?: string[] | null
  detailLabel?: string
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 ${
        checked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
      }`}>
        {checked ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="text-gray-900">{label}</p>
        {checked && details && details.length > 0 && (
          <div className="mt-2 bg-gray-50 p-3 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-1">{detailLabel}</p>
            <ul className="text-sm text-gray-900 space-y-1">
              {details.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return `${age} yaşında`
}