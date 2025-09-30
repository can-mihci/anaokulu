'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    date_of_birth: '',
    grade_level: 1,
    academic_year: '',
    national_id: '',
    enrollment_date: '',
    status: 'active',
    
    // Health
    has_chronic_illness: false,
    medicines: '',
    has_allergies: false,
    allergies: '',
    has_special_dietary_needs: false,
    dietary_needs: '',
    
    // Education
    toilet_training_completed: false,
    studied_elsewhere_before: false,
    previous_institution_name: '',
    has_special_educational_needs: false,
    special_educational_needs_details: '',
    
    // Social
    socialization_status: '',
    
    // Emergency
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  })

  // Load student data
  useEffect(() => {
    async function loadStudent() {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !student) {
        setError('Öğrenci bulunamadı')
        setInitialLoading(false)
        return
      }

      // Convert arrays to comma-separated strings for form
      setFormData({
        name: student.name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        grade_level: student.grade_level,
        academic_year: student.academic_year,
        national_id: student.national_id,
        enrollment_date: student.enrollment_date,
        status: student.status,
        
        has_chronic_illness: student.has_chronic_illness,
        medicines: student.medicines ? student.medicines.join(', ') : '',
        has_allergies: student.has_allergies,
        allergies: student.allergies ? student.allergies.join(', ') : '',
        has_special_dietary_needs: student.has_special_dietary_needs,
        dietary_needs: student.dietary_needs ? student.dietary_needs.join(', ') : '',
        
        toilet_training_completed: student.toilet_training_completed,
        studied_elsewhere_before: student.studied_elsewhere_before,
        previous_institution_name: student.previous_institution_name || '',
        has_special_educational_needs: student.has_special_educational_needs,
        special_educational_needs_details: student.special_educational_needs_details 
          ? student.special_educational_needs_details.join(', ') 
          : '',
        
        socialization_status: student.socialization_status || '',
        
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_phone: student.emergency_contact_phone || '',
        emergency_contact_relationship: student.emergency_contact_relationship || '',
      })

      setInitialLoading(false)
    }

    loadStudent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Convert string fields to arrays where needed
      const studentData = {
        ...formData,
        medicines: formData.medicines ? formData.medicines.split(',').map(m => m.trim()) : null,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : null,
        dietary_needs: formData.dietary_needs ? formData.dietary_needs.split(',').map(d => d.trim()) : null,
        special_educational_needs_details: formData.special_educational_needs_details 
          ? formData.special_educational_needs_details.split(',').map(s => s.trim()) 
          : null,
      }

      const { error: updateError } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)

      if (updateError) throw updateError

      router.push(`/admin/students/${id}`)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Öğrenci Düzenle</h1>
        <p className="text-gray-600 mt-1">Öğrenci bilgilerini güncelleyin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doğum Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TC Kimlik No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                required
                maxLength={11}
                pattern="[0-9]{11}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sınıf Seviyesi
              </label>
              <input
                type="number"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
                min="1"
                max="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Akademik Yıl
              </label>
              <input
                type="text"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                placeholder="2024-2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kayıt Tarihi
              </label>
              <input
                type="date"
                name="enrollment_date"
                value={formData.enrollment_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="graduated">Mezun</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sağlık Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="has_chronic_illness"
                  checked={formData.has_chronic_illness}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Kronik hastalığı var</span>
              </label>
              {formData.has_chronic_illness && (
                <input
                  type="text"
                  name="medicines"
                  value={formData.medicines}
                  onChange={handleChange}
                  placeholder="İlaçları virgülle ayırarak yazın"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="has_allergies"
                  checked={formData.has_allergies}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Alerjisi var</span>
              </label>
              {formData.has_allergies && (
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Alerjileri virgülle ayırarak yazın"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="has_special_dietary_needs"
                  checked={formData.has_special_dietary_needs}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Özel beslenme ihtiyacı var</span>
              </label>
              {formData.has_special_dietary_needs && (
                <input
                  type="text"
                  name="dietary_needs"
                  value={formData.dietary_needs}
                  onChange={handleChange}
                  placeholder="Beslenme ihtiyaçlarını virgülle ayırarak yazın"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              )}
            </div>
          </div>
        </div>

        {/* Educational Background */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Eğitim Geçmişi</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="toilet_training_completed"
                checked={formData.toilet_training_completed}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Tuvalet eğitimi tamamlandı</span>
            </label>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="studied_elsewhere_before"
                  checked={formData.studied_elsewhere_before}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Daha önce başka kurumda okudu</span>
              </label>
              {formData.studied_elsewhere_before && (
                <input
                  type="text"
                  name="previous_institution_name"
                  value={formData.previous_institution_name}
                  onChange={handleChange}
                  placeholder="Önceki kurum adı"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="has_special_educational_needs"
                  checked={formData.has_special_educational_needs}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Özel eğitim ihtiyacı var</span>
              </label>
              {formData.has_special_educational_needs && (
                <input
                  type="text"
                  name="special_educational_needs_details"
                  value={formData.special_educational_needs_details}
                  onChange={handleChange}
                  placeholder="Detayları virgülle ayırarak yazın"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              )}
            </div>
          </div>
        </div>

        {/* Social & Emergency */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sosyal Bilgiler ve Acil Durum</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sosyalleşme Durumu
              </label>
              <textarea
                name="socialization_status"
                value={formData.socialization_status}
                onChange={handleChange}
                rows={3}
                placeholder="Çocuğun diğer çocuklarla nasıl davrandığını açıklayın"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acil Durum İletişim Kişisi
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Boş bırakılırsa veli bilgisi kullanılır"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yakınlık Derecesi
                </label>
                <input
                  type="text"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}