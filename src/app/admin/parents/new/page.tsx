'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function NewParentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)

  // Generate random password function
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
    occupation: '',
    password: generatePassword(), // Auto-generate on mount
  })

  // Student linking state
  const [selectedStudents, setSelectedStudents] = useState<Array<{
    student_id: string
    relationship_type: string
    is_primary_contact: boolean
  }>>([])

  // Fetch students for linking
  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase
        .from('students')
        .select('id, name, last_name')
        .eq('status', 'active')
        .order('last_name')
      
      if (data) setStudents(data)
    }
    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı')

      // Step 2: Create parent record
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .insert([{
          name: formData.name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          occupation: formData.occupation,
          auth_user_id: authData.user.id,
        }])
        .select()
        .single()

      if (parentError) throw parentError

      // Step 3: Link to students if any selected
      if (selectedStudents.length > 0) {
        const studentLinks = selectedStudents.map(link => ({
          parent_id: parentData.id,
          student_id: link.student_id,
          relationship_type: link.relationship_type,
          is_primary_contact: link.is_primary_contact,
        }))

        const { error: linkError } = await supabase
          .from('student_parents')
          .insert(studentLinks)

        if (linkError) throw linkError
      }

      router.push('/admin/parents')
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

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Veli Ekle</h1>
        <p className="text-gray-600 mt-1">Sisteme yeni veli kaydı yapın</p>
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
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Giriş yapmak için kullanılacak</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, password: generatePassword() }))}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm font-medium"
                >
                  Yeni Şifre
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Otomatik oluşturuldu • En az 6 karakter • İsterseniz değiştirebilirsiniz
              </p>
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
            <div>
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
              Henüz öğrenci eklenmedi. Veli kaydedildikten sonra da ekleyebilirsiniz.
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
            {loading ? 'Kaydediliyor...' : 'Veliyi Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}