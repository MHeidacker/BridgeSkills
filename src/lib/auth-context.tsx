'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { JobRecommendation } from './types'

interface UserProfile {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
}

interface SavedMatch {
  id: string
  job_title: string
  match_score: number
  salary_range: string
  match_reason: string
  required_skills: string[]
  created_at: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  savedMatches: SavedMatch[]
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  saveMatch: (match: JobRecommendation) => Promise<void>
  deleteSavedMatch: (matchId: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([])

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
        fetchSavedMatches(session.user.id)
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
        await fetchSavedMatches(session.user.id)
      } else {
        setProfile(null)
        setSavedMatches([])
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchSavedMatches = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_matches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedMatches(data || [])
    } catch (error) {
      console.error('Error fetching saved matches:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with email:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })
      
      if (error) throw error

      if (user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: name,
          })

        if (profileError) throw profileError
      }
    } catch (error) {
      console.error('Error signing up with email:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      setSavedMatches([])
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const saveMatch = async (match: JobRecommendation) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_matches')
        .insert({
          user_id: user.id,
          job_title: match.title,
          match_score: Math.round(match.matchScore),
          salary_range: match.salaryRange,
          match_reason: match.matchReason,
          required_skills: match.requiredSkills
        })

      if (error) throw error
      await fetchSavedMatches(user.id)
    } catch (error) {
      console.error('Error saving match:', error)
      throw error
    }
  }

  const deleteSavedMatch = async (matchId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_matches')
        .delete()
        .eq('id', matchId)

      if (error) throw error
      setSavedMatches(savedMatches.filter(match => match.id !== matchId))
    } catch (error) {
      console.error('Error deleting saved match:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      await fetchUserProfile(user.id)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      savedMatches,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      saveMatch,
      deleteSavedMatch,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 