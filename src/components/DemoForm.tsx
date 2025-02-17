'use client'

import { useState, useEffect } from 'react'
import { ExtractedData, Experience, RecommendationResponse } from '@/lib/types'
import { JobRecommendations } from './JobRecommendations'
import { JobRecommendationsSkeleton } from './JobRecommendationsSkeleton'
import { Plus, Minus } from 'lucide-react'
import { Select } from './Select'
import {
  MILITARY_RANKS,
  MILITARY_BRANCHES,
  MILITARY_CODES,
  COMMON_MILITARY_SKILLS,
  type MilitaryBranch,
  type MilitaryCode,
  type MilitaryRank,
  type MilitarySkill,
  getRankDescription
} from '@/lib/constants'

const SAMPLE_DATA: ExtractedData = {
  skills: [
    'Leadership',
    'Cybersecurity',
    'Intelligence Analysis',
    'Operations Management'
  ] as MilitarySkill[],
  experience: [
    {
      title: 'Cyber Operations Officer',
      duration: '3 years'
    },
    {
      title: 'Intelligence Analyst',
      duration: '2 years'
    }
  ],
  education: ['Bachelor of Science in Computer Science'],
  militaryInfo: {
    rank: 'O-3' as MilitaryRank,
    branch: 'Air Force' as MilitaryBranch,
    mos: '17S'
  }
}

interface DemoFormProps {
  initialData?: ExtractedData | null
}

export function DemoForm({ initialData }: DemoFormProps) {
  const [data, setData] = useState<ExtractedData>(initialData || SAMPLE_DATA)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filteredCodes, setFilteredCodes] = useState<MilitaryCode[]>([...MILITARY_CODES])

  // Filter MOS/AFSC codes based on selected branch
  useEffect(() => {
    if (data.militaryInfo.branch) {
      setFilteredCodes(
        [...MILITARY_CODES].filter(code => code.branch === data.militaryInfo.branch)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/demo/job-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const result = await response.json()
      setRecommendations(result)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to generate recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <JobRecommendationsSkeleton />
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
            onClick={() => setRecommendations(null)}
            className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            ← Back to Form
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out">
      <h2 className="text-2xl font-bold mb-6">Try Demo</h2>
      <p className="text-gray-600 mb-6">
        See how your military experience translates to civilian careers with our sample data.
        Feel free to modify the information below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Military Information */}
        <div className="transition-all duration-300 ease-in-out">
          <h3 className="text-lg font-semibold mb-4">Military Background</h3>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Rank"
              value={data.militaryInfo.rank || ''}
              onChange={(e) => setData({
                ...data,
                militaryInfo: { ...data.militaryInfo, rank: e.target.value as MilitaryRank }
              })}
              options={MILITARY_RANKS.map(rank => ({
                value: rank,
                label: `${rank} - ${getRankDescription(rank)}`
              }))}
            />
            <Select
              label="Branch"
              value={data.militaryInfo.branch || ''}
              onChange={(e) => setData({
                ...data,
                militaryInfo: { ...data.militaryInfo, branch: e.target.value as MilitaryBranch }
              })}
              options={MILITARY_BRANCHES.map(branch => ({
                value: branch,
                label: branch
              }))}
            />
            <Select
              label="MOS/AFSC"
              value={data.militaryInfo.mos || ''}
              onChange={(e) => setData({
                ...data,
                militaryInfo: { ...data.militaryInfo, mos: e.target.value }
              })}
              options={filteredCodes.map(code => ({
                value: code.code,
                label: `${code.code} - ${code.title}`
              }))}
              error={data.militaryInfo.branch && filteredCodes.length === 0 ? 
                'No codes available for selected branch' : undefined}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Select your branch first to see relevant MOS/AFSC codes
          </p>
        </div>

        {/* Skills */}
        <div className="transition-all duration-300 ease-in-out">
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_MILITARY_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillSelect(skill)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${data.skills.includes(skill)
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
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
        <div className="transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Experience</h3>
            <button
              type="button"
              onClick={addExperience}
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
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
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="transition-all duration-300 ease-in-out">
          <h3 className="text-lg font-semibold mb-4">Education</h3>
          <input
            type="text"
            value={data.education.join(', ')}
            onChange={(e) => setData({
              ...data,
              education: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter education, separated by commas"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm animate-fadeIn">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {loading ? 'Generating Recommendations...' : 'Generate Career Recommendations'}
        </button>
      </form>
    </div>
  )
} 