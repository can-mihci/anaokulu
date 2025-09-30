import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Type definitions for our database
export type UserRole = 'admin' | 'teacher' | 'parent'
export type StudentStatus = 'active' | 'inactive' | 'graduated'
export type RelationshipType = 'mother' | 'father' | 'guardian' | 'other'
export type MealType = 'breakfast' | 'lunch'
export type MealRating = 'not_well' | 'adequate' | 'more_than_enough'

export interface Admin {
  id: string
  name: string
  last_name: string
  email: string
  auth_user_id: string
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  name: string
  last_name: string
  email: string
  auth_user_id: string
  created_at: string
  updated_at: string
}

export interface Parent {
  id: string
  name: string
  last_name: string
  email: string
  phone_number: string
  occupation: string
  auth_user_id: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  name: string
  last_name: string
  date_of_birth: string
  photo_url?: string
  grade_level: number
  academic_year: string
  national_id: string
  enrollment_date: string
  status: StudentStatus
  has_chronic_illness: boolean
  medicines?: string[]
  has_allergies: boolean
  allergies?: string[]
  has_special_dietary_needs: boolean
  dietary_needs?: string[]
  toilet_training_completed: boolean
  studied_elsewhere_before: boolean
  previous_institution_name?: string
  has_special_educational_needs: boolean
  special_educational_needs_details?: string[]
  socialization_status?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  created_at: string
  updated_at: string
}

export interface StudentParent {
  id: string
  student_id: string
  parent_id: string
  relationship_type: RelationshipType
  is_primary_contact: boolean
  created_at: string
}

export interface Meal {
  id: string
  date: string
  meal_type: MealType
  meal_ingredients: string
  meal_calories?: number
  created_at: string
  updated_at: string
}

export interface MealRecord {
  id: string
  student_id: string
  meal_id: string
  teacher_id: string
  rating: MealRating
  notes?: string
  created_at: string
  updated_at: string
}