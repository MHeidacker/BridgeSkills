'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { ExtractedData, Experience, RecommendationResponse } from '@/lib/types'
import { JobRecommendations } from './JobRecommendations'
import { JobRecommendationsSkeleton } from './JobRecommendationsSkeleton'
import { Plus, Minus } from 'lucide-react'
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from './ui/select'
import { 
  MilitarySkill, 
  MilitaryBranch, 
  MilitaryRank,
  MilitaryCode,
  MILITARY_BRANCHES,
  MILITARY_RANKS,
  MILITARY_CODES,
  COMMON_MILITARY_SKILLS,
  getRankDescription
} from '@/lib/constants'

const DEGREE_TYPES = [
  'High School',
  'Associate',
  'Bachelor',
  'Master',
  'Doctorate',
  'Certification',
  'Other'
] as const

type DegreeType = typeof DEGREE_TYPES[number]

interface Education {
  type: DegreeType
  field: string
}

const INITIAL_DATA: ExtractedData = {
  skills: [] as MilitarySkill[],
  experience: [],
  education: [] as Education[],
  militaryInfo: {
    rank: undefined,
    branch: undefined,
    mos: undefined
  }
}

interface CareerFormProps {
  initialData?: ExtractedData | null
}

export function CareerForm({ initialData }: CareerFormProps) {
  const [data, setData] = useState<ExtractedData>(initialData || INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filteredCodes, setFilteredCodes] = useState<MilitaryCode[]>([...MILITARY_CODES])

  // Filter MOS/AFSC codes based on selected branch
  useEffect(() => {
    if (data.militaryInfo.branch) {
      setFilteredCodes(
        MILITARY_CODES.filter(code => code.branch === data.militaryInfo.branch)
      )
      // Clear MOS if branch changes
      if (!MILITARY_CODES.find(code => 
        code.branch === data.militaryInfo.branch && 
        code.code === data.militaryInfo.mos
      )) {
        setData(prev => ({
          ...prev,
          militaryInfo: { ...prev.militaryInfo, mos: undefined }
        }))
      }
    } else {
      setFilteredCodes([...MILITARY_CODES])
    }
  }, [data.militaryInfo.branch])

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])

  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { title: '', duration: '' }]
    })
  }

  const removeExperience = (index: number) => {
    setData({
      ...data,
      experience: data.experience.filter((_, i) => i !== index)
    })
  }

  const handleSkillSelect = (skill: MilitarySkill) => {
    const updatedSkills = data.skills.includes(skill)
      ? data.skills.filter(s => s !== skill)
      : [...data.skills, skill]
    setData({ ...data, skills: updatedSkills })
  }

  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { type: 'Bachelor', field: '' }]
    })
  }

  const removeEducation = (index: number) => {
    setData({
      ...data,
      education: data.education.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRecommendations(null) // Reset recommendations when starting new search

    // Validate required fields
    if (!data.militaryInfo.branch) {
      setError('Please select a military branch')
      setLoading(false)
      return
    }

    if (data.skills.length === 0) {
      setError('Please select at least one skill')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/career-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate recommendations')
      }

      const result = await response.json()
      if (!result || !result.recommendations) {
        throw new Error('Invalid response format')
      }

      setRecommendations(result)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate recommendations. Please try again.')
      setRecommendations(null) // Clear recommendations on error
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-lg text-gray-700">Analyzing your background...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    )
  }

  if (recommendations) {
    return (
      <div className="transition-opacity duration-300 ease-in-out">
        <JobRecommendations
          recommendations={recommendations.recommendations}
          marketInsights={recommendations.marketInsights}
        />
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setRecommendations(null)
              setLoading(false)
            }}
            className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            ← Back to Form
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Military Information */}
      <div className="transition-all duration-300 ease-in-out bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Military Background</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="rank" className="text-sm font-medium">Rank</label>
            <Select 
              value={data.militaryInfo.rank || undefined} 
              onValueChange={(value) => 
                setData({
                  ...data,
                  militaryInfo: {
                    ...data.militaryInfo,
                    rank: value as MilitaryRank
                  }
                })
              }
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select Rank" />
              </SelectTrigger>
              <SelectContent className="bg-white border rounded-md shadow-md">
                {MILITARY_RANKS.map(rank => (
                  <SelectItem key={rank} value={rank}>
                    {getRankDescription(rank)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="branch" className="text-sm font-medium">Branch</label>
            <Select 
              value={data.militaryInfo.branch || undefined} 
              onValueChange={(value) =>
                setData({
                  ...data,
                  militaryInfo: {
                    ...data.militaryInfo,
                    branch: value as MilitaryBranch
                  }
                })
              }
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent className="bg-white border rounded-md shadow-md">
                {MILITARY_BRANCHES.map(branch => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="mos" className="text-sm font-medium">MOS/AFSC</label>
            <Select 
              value={data.militaryInfo.mos || undefined} 
              onValueChange={(value) =>
                setData({
                  ...data,
                  militaryInfo: {
                    ...data.militaryInfo,
                    mos: value
                  }
                })
              }
            >
              <SelectTrigger className={`w-full bg-background ${error ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select MOS/AFSC" />
              </SelectTrigger>
              <SelectContent className="bg-white border rounded-md shadow-md">
                {filteredCodes.map(code => (
                  <SelectItem key={code.code} value={code.code}>
                    {code.code.split('_')[0]} - {code.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Select your branch first to see relevant MOS/AFSC codes
        </p>
      </div>

      {/* Skills */}
      <div className="transition-all duration-300 ease-in-out bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_MILITARY_SKILLS.map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => handleSkillSelect(skill)}
              className={`btn ${
                data.skills.includes(skill)
                  ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}
            >
              {skill}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Click to select/deselect skills
        </p>
      </div>

      {/* Experience */}
      <div className="transition-all duration-300 ease-in-out bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Experience</h3>
          <button
            type="button"
            onClick={addExperience}
            className="btn btn-ghost flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>
        {data.experience.map((exp, index) => (
          <div 
            key={index} 
            className="flex gap-4 mb-4 items-start animate-fadeIn"
          >
            <div className="flex-1 space-y-4">
              <input
                type="text"
                value={exp.title}
                onChange={(e) => {
                  const newExp = [...data.experience]
                  newExp[index] = { ...exp, title: e.target.value }
                  setData({ ...data, experience: newExp })
                }}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Job Title"
              />
              <input
                type="text"
                value={exp.duration}
                onChange={(e) => {
                  const newExp = [...data.experience]
                  newExp[index] = { ...exp, duration: e.target.value }
                  setData({ ...data, experience: newExp })
                }}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Duration (e.g., 2 years)"
              />
            </div>
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="btn btn-ghost p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="transition-all duration-300 ease-in-out bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Education</h3>
          <button
            type="button"
            onClick={addEducation}
            className="btn btn-ghost flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
        {data.education.map((edu, index) => (
          <div 
            key={index} 
            className="flex gap-4 mb-4 items-start animate-fadeIn"
          >
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor={`education-${index}-type`} className="text-sm font-medium">
                    Degree Type
                  </label>
                  <Select
                    value={edu.type}
                    onValueChange={(value) => {
                      const newEducation = [...data.education]
                      newEducation[index] = { ...edu, type: value as DegreeType }
                      setData({ ...data, education: newEducation })
                    }}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select Degree Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border rounded-md shadow-md">
                      {DEGREE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor={`education-${index}-field`} className="text-sm font-medium">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    id={`education-${index}-field`}
                    value={edu.field}
                    onChange={(e) => {
                      const newEducation = [...data.education]
                      newEducation[index] = { ...edu, field: e.target.value }
                      setData({ ...data, education: newEducation })
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="btn btn-ghost p-2 text-gray-400 hover:text-red-500 transition-colors mt-7"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        ))}
        {data.education.length === 0 && (
          <p className="text-gray-500 text-sm">
            Click "Add Education" to include your educational background
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm animate-fadeIn">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full py-3 px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium"
      >
        {loading ? 'Analyzing Your Background...' : 'Get Career Recommendations'}
      </button>
    </form>
  )
} 