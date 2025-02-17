'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Minus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TechnicalSkillsForm } from './TechnicalSkillsForm'
import { 
  ExtractedData,
  TechnicalSkill, 
  Certification,
  Experience,
  Education,
  MilitaryInfo,
  DegreeType,
  ServiceType,
  MilitaryBranch,
  MilitaryRank
} from '@/lib/types'
import {
  MILITARY_CODES,
  COMMON_MILITARY_SKILLS,
  MILITARY_BRANCHES,
  MILITARY_RANKS,
  MilitaryCode,
  MilitarySkill,
  getRankDescription,
  SERVICE_TYPES
} from '@/lib/constants'
import { JobRecommendations } from './JobRecommendations'
import { JobRecommendationsSkeleton } from './JobRecommendationsSkeleton'
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from './ui/select'

const DEGREE_TYPES: readonly DegreeType[] = [
  'High School',
  'Associate',
  'Bachelor',
  'Master',
  'Doctorate',
  'Certification',
  'Other'
]

interface CareerFormProps {
  initialData?: ExtractedData | null
  onSuccess: (data: any) => void
}

const INITIAL_STATE: ExtractedData = {
  militaryInfo: { rank: undefined, branch: undefined, mos: undefined },
  skills: [],
  technicalSkills: [],
  certifications: [],
  experience: [],
  education: []
}

interface SelectEvent extends React.ChangeEvent<HTMLSelectElement> {
  target: HTMLSelectElement & {
    value: string
  }
}

export function CareerForm({ initialData, onSuccess }: CareerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filteredCodes, setFilteredCodes] = useState<MilitaryCode[]>([...MILITARY_CODES])
  
  const [militaryInfo, setMilitaryInfo] = useState<MilitaryInfo>(
    initialData?.militaryInfo || {}
  )
  const [skills, setSkills] = useState<MilitarySkill[]>(
    initialData?.skills || INITIAL_STATE.skills
  )
  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkill[]>(
    initialData?.technicalSkills || INITIAL_STATE.technicalSkills
  )
  const [certifications, setCertifications] = useState<Certification[]>(
    initialData?.certifications || INITIAL_STATE.certifications
  )
  const [experience, setExperience] = useState<Experience[]>(
    initialData?.experience || INITIAL_STATE.experience
  )
  const [education, setEducation] = useState<Education[]>(
    initialData?.education || INITIAL_STATE.education
  )

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Filter ranks based on service type
  const availableRanks = militaryInfo.serviceType 
    ? MILITARY_RANKS[militaryInfo.serviceType]
    : []

  // Filter MOS codes based on service type and branch
  const availableMOSCodes = MILITARY_CODES.filter(code => 
    (!militaryInfo.serviceType || code.serviceType === militaryInfo.serviceType) &&
    (!militaryInfo.branch || code.branch === militaryInfo.branch)
  )

  // Filter MOS/AFSC codes based on selected branch
  useEffect(() => {
    if (militaryInfo.branch) {
      setFilteredCodes(
        MILITARY_CODES.filter(code => code.branch === militaryInfo.branch)
      )
      // Clear MOS if branch changes
      if (!MILITARY_CODES.find(code => 
        code.branch === militaryInfo.branch && 
        code.code === militaryInfo.mos
      )) {
        setMilitaryInfo(prev => ({ ...prev, mos: undefined }))
      }
    } else {
      setFilteredCodes([...MILITARY_CODES])
    }
  }, [militaryInfo.branch])

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setMilitaryInfo(initialData.militaryInfo)
      setSkills(initialData.skills)
      setTechnicalSkills(initialData.technicalSkills)
      setCertifications(initialData.certifications)
      setExperience(initialData.experience)
      setEducation(initialData.education)
    }
  }, [initialData])

  const addExperience = () => {
    setExperience([...experience, {
      title: '',
      organization: '',
      startDate: '',
      description: '',
      skills: []
    }])
  }

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  const handleSkillSelect = (skill: MilitarySkill) => {
    const updatedSkills = skills.includes(skill)
      ? skills.filter(s => s !== skill)
      : [...skills, skill]
    setSkills(updatedSkills)
  }

  const addEducation = () => {
    setEducation([...education, {
      type: 'Bachelor',
      field: '',
      institution: '',
      graduationDate: '',
    }])
  }

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const handleServiceTypeChange = (e: SelectEvent) => {
    const serviceType = e.target.value as ServiceType
    setMilitaryInfo(prev => ({
      ...prev,
      serviceType,
      rank: undefined,
      mos: undefined
    }))
  }

  const handleBranchChange = (e: SelectEvent) => {
    const branch = e.target.value as MilitaryBranch
    setMilitaryInfo(prev => ({
      ...prev,
      branch,
      mos: undefined
    }))
  }

  const handleRankChange = (e: SelectEvent) => {
    setMilitaryInfo(prev => ({
      ...prev,
      rank: e.target.value as MilitaryRank
    }))
  }

  const handleMOSChange = (e: SelectEvent) => {
    setMilitaryInfo(prev => ({
      ...prev,
      mos: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Starting career mapping submission...')
      console.log('Submission data:', {
        militaryInfo,
        skills,
        technicalSkills,
        certifications,
        experience,
        education,
      })

      const response = await fetch('/api/career-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          militaryInfo,
          skills,
          technicalSkills,
          certifications,
          experience,
          education,
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(`Failed to process career mapping: ${data.error || response.statusText}`)
      }

      if (!data || !data.recommendations) {
        throw new Error('Invalid response format: missing recommendations')
      }

      onSuccess(data)
    } catch (error) {
      console.error('Career mapping error:', error)
      setError(error instanceof Error ? error.message : 'Failed to process career mapping. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-lg text-gray-700">Analyzing your background...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Military Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Military Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={militaryInfo.serviceType || ''}
              onChange={handleServiceTypeChange}
            >
              <option value="">Select Service Type</option>
              {SERVICE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={militaryInfo.branch || ''}
              onChange={handleBranchChange}
            >
              <option value="">Select Branch</option>
              {MILITARY_BRANCHES.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rank
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={militaryInfo.rank || ''}
              onChange={handleRankChange}
              disabled={!militaryInfo.serviceType}
            >
              <option value="">Select Rank</option>
              {availableRanks.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              MOS/AFSC
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={militaryInfo.mos || ''}
              onChange={handleMOSChange}
              disabled={!militaryInfo.serviceType || !militaryInfo.branch}
            >
              <option value="">Select MOS/AFSC</option>
              {availableMOSCodes.map(code => (
                <option key={code.code} value={code.code}>
                  {code.code} - {code.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Military Skills</h3>
          <span className="text-sm text-gray-600">
            {skills.length} selected
          </span>
        </div>

        <div className="space-y-4">
          {/* Leadership & Management Skills */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'leadership' ? null : 'leadership')}
              className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
            >
              <span className="font-medium">Leadership & Management</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${
                  expandedCategory === 'leadership' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {expandedCategory === 'leadership' && (
              <div className="p-4 bg-white flex flex-wrap gap-2">
                {COMMON_MILITARY_SKILLS.filter(skill => [
                  'Leadership',
                  'Project Management',
                  'Team Building',
                  'Strategic Planning',
                  'Risk Management',
                  'Operations Management',
                  'Training & Development',
                  'Personnel Management',
                  'Change Management',
                  'Resource Management',
                ].includes(skill)).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    className={`btn ${
                      skills.includes(skill)
                        ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cyber & Technical Skills */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'cyber' ? null : 'cyber')}
              className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
            >
              <span className="font-medium">Cyber & Technical</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${
                  expandedCategory === 'cyber' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {expandedCategory === 'cyber' && (
              <div className="p-4 bg-white flex flex-wrap gap-2">
                {COMMON_MILITARY_SKILLS.filter(skill => [
                  'Cybersecurity',
                  'Network Security',
                  'System Administration',
                  'Information Security',
                  'Cloud Computing',
                  'Network Operations',
                  'Vulnerability Assessment',
                  'Incident Response',
                  'Digital Forensics',
                  'Security Architecture',
                ].includes(skill)).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    className={`btn ${
                      skills.includes(skill)
                        ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Intelligence & Analysis Skills */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'intelligence' ? null : 'intelligence')}
              className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
            >
              <span className="font-medium">Intelligence & Analysis</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${
                  expandedCategory === 'intelligence' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {expandedCategory === 'intelligence' && (
              <div className="p-4 bg-white flex flex-wrap gap-2">
                {COMMON_MILITARY_SKILLS.filter(skill => [
                  'Intelligence Analysis',
                  'Data Analysis',
                  'Threat Analysis',
                  'SIGINT',
                  'HUMINT',
                  'OSINT',
                  'Counterintelligence',
                  'Intelligence Collection',
                  'Intelligence Reporting',
                  'Target Analysis',
                ].includes(skill)).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    className={`btn ${
                      skills.includes(skill)
                        ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* General Skills */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'general' ? null : 'general')}
              className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
            >
              <span className="font-medium">General Skills</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${
                  expandedCategory === 'general' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {expandedCategory === 'general' && (
              <div className="p-4 bg-white flex flex-wrap gap-2">
                {COMMON_MILITARY_SKILLS.filter(skill => [
                  'Problem Solving',
                  'Communication',
                  'Technical Writing',
                  'Critical Thinking',
                  'Research',
                  'Documentation',
                  'Quality Assurance',
                  'Policy Development',
                  'Cross-functional Coordination',
                  'Requirements Analysis',
                ].includes(skill)).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    className={`btn ${
                      skills.includes(skill)
                        ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Skills and Certifications */}
      <TechnicalSkillsForm
        technicalSkills={technicalSkills}
        certifications={certifications}
        onTechnicalSkillsChange={setTechnicalSkills}
        onCertificationsChange={setCertifications}
      />

      {/* Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Experience</h3>
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={addExperience}
            className="btn btn-ghost flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>
        {experience.map((exp, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg relative">
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="absolute top-2 right-2"
            >
              <Minus className="h-4 w-4 text-gray-500" />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => {
                    const newExp = [...experience]
                    newExp[index] = { ...exp, title: e.target.value }
                    setExperience(newExp)
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <input
                  type="text"
                  value={exp.organization}
                  onChange={(e) => {
                    const newExp = [...experience]
                    newExp[index] = { ...exp, organization: e.target.value }
                    setExperience(newExp)
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={exp.startDate}
                  onChange={(e) => {
                    const newExp = [...experience]
                    newExp[index] = { ...exp, startDate: e.target.value }
                    setExperience(newExp)
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={exp.endDate || ''}
                  onChange={(e) => {
                    const newExp = [...experience]
                    newExp[index] = { ...exp, endDate: e.target.value || undefined }
                    setExperience(newExp)
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={exp.description}
                onChange={(e) => {
                  const newExp = [...experience]
                  newExp[index] = { ...exp, description: e.target.value }
                  setExperience(newExp)
                }}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills
              </label>
              <input
                type="text"
                value={exp.skills.join(', ')}
                onChange={(e) => {
                  const newExp = [...experience]
                  newExp[index] = { 
                    ...exp, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }
                  setExperience(newExp)
                }}
                placeholder="Enter skills, separated by commas"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Education</h3>
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={addEducation}
            className="btn btn-ghost flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
        {education.map((edu, index) => (
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
                      const newEducation = [...education]
                      newEducation[index] = { ...edu, type: value as DegreeType }
                      setEducation(newEducation)
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
                      const newEducation = [...education]
                      newEducation[index] = { ...edu, field: e.target.value }
                      setEducation(newEducation)
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
        {education.length === 0 && (
          <p className="text-gray-500 text-sm">
            Click "Add Education" to include your educational background
          </p>
        )}
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full py-3 px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Get Career Recommendations'
        )}
      </button>
    </form>
  )
} 