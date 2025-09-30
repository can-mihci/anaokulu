'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'

export default function EditParentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
    occupation: '',
  })

  // Student linking state
  const [selectedStudents, setSelectedStudents] = useState<Array<{
    id?: string
    student_id: string
    relationship_type: string
    is_primary_contact: boolean
  }>>([])

  // Load parent data and students
  useEffect(() => {
    async function loadData() {
      // Fetch parent with current student links
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select(`
          *,
          student_parents (
            id,
            student_id,
            relationship_type,
            is_primary_contact
          )
        `)
        .eq('id', id)
        .single()

      if (parentError || !parent) {
        setError('Veli bulunamadı')
        setInitialLoading(false)
        return
      }

      setFormData({
        name: parent.name,
        last_name: parent.last_name,
        email: parent.email,
        phone_number: parent.phone_number,
        occupation: parent.occupation || '',
      })

      // Set existing student links
      if (parent.student_parents && parent.student_parents.length > 0) {
        setSelectedStudents(parent.student_parents.map((sp: any) => ({
          id: sp.id,
          student_id: sp.student_id,
          relationship_type: sp.relationship_type,
          is_primary_contact: sp.is_primary_contact,
        })))
      }

      // Fetch all active students for dropdown
      const { data: allStudents } = await supabase
        .from('students')
        .select('id, name, last_name')
        .eq('status', 'active')
        .order('last_name')
      
      if (allStudents) setStudents(allStudents)

      setInitialLoading(false)
    }

    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Update parent basic info
      const { error: updateError } = await supabase
        .from('parents')
        .update({
          name: formData.name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          occupation: formData.occupation,
          // Note: email is not updated as it's tied to auth
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Handle student links
      // Get existing link IDs
      const existingLinkIds = selectedStudents
        .filter(link => link.id)
        .map(link => link.id) as string[]

      // Delete removed links
      const { data: currentLinks } = await supabase
        .from('student_parents')
        .select('id')
        .eq('parent_id', id)

      if (currentLinks) {
        const linksToDelete = currentLinks
          .filter(link => !existingLinkIds.includes(link.id))
          .map(link => link.id)

        if (linksToDelete.length > 0) {
          await supabase
            .from('student_parents')
            .delete()
            .in('id', linksToDelete)
        }
      }

      // Update existing links and insert new ones
      for (const link of selectedStudents) {
        if (link.id) {
          // Update existing link
          await supabase
            .from('student_parents')
            .update({
              relationship_type: link.relationship_type,
              is_primary_contact: link.is_primary_contact,
            })
            .eq('id', link.id)
        } else {
          // Insert new link
          await supabase
            .from('student_parents')
            .insert({
              parent_id: id,
              student_id: link.student_id,
              relationship_type: link.relationship_type,
              is_primary_contact: link.is_primary_contact,
            })
        }
      }

      router.push(`/admin/parents/${id}`)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addStudentLink = () => {
    setSelectedStudents(prev => [
      ...prev,
      { student_id: '', relationship_type: 'mother', is_primary_contact: false }
    ])
  }

  const removeStudentLink = (index: number) => {
    setSelectedStudents(prev => prev.filter((_, i) => i !== index))
  }

  const updateStudentLink = (index: number, field: string, value: any) => {
    setSelectedStudents(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
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
        <h1 className="text-3xl font-bold text-gray-900">Veli Düzenle</h1>
        <p className="text-gray-600 mt-1">Veli bilgilerini güncelleyin</p>
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
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">E-posta değiştirilemez (giriş hesabına bağlı)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meslek
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Link to Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Öğrenci Bağlantıları</h2>
              <p className="text-sm text-gray-600 mt-1">Bu veliyi öğrencilere bağlayın</p>
            </div>
            <button
              type="button"
              onClick={addStudentLink}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Öğrenci Ekle</span>
            </button>
          </div>

          {selectedStudents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Henüz öğrenci eklenmedi
            </p>
          ) : (
            <div className="space-y-4">
              {selectedStudents.map((link, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Öğrenci
                      </label>
                      <select
                        value={link.student_id}
                        onChange={(e) => updateStudentLink(index, 'student_id', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                      >
                        <option value="">Seçin...</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} {student.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Yakınlık
                      </label>
                      <select
                        value={link.relationship_type}
                        onChange={(e) => updateStudentLink(index, 'relationship_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                      >
                        <option value="mother">Anne</option>
                        <option value="father">Baba</option>
                        <option value="guardian">Vasi</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.is_primary_contact}
                          onChange={(e) => updateStudentLink(index, 'is_primary_contact', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Birincil İletişim</span>
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStudentLink(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
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