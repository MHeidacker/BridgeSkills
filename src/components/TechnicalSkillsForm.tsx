'use client'

import { useState, ChangeEvent } from 'react'
import { TechnicalSkill, Certification } from '@/lib/types'
import { TECHNICAL_SKILLS, COMMON_CERTIFICATIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'

interface TechnicalSkillsFormProps {
  technicalSkills: TechnicalSkill[]
  certifications: Certification[]
  onTechnicalSkillsChange: (skills: TechnicalSkill[]) => void
  onCertificationsChange: (certs: Certification[]) => void
}

export function TechnicalSkillsForm({
  technicalSkills,
  certifications,
  onTechnicalSkillsChange,
  onCertificationsChange
}: TechnicalSkillsFormProps) {
  const [newSkill, setNewSkill] = useState<Partial<TechnicalSkill>>({})
  const [newCert, setNewCert] = useState<Partial<Certification>>({})

  const addTechnicalSkill = () => {
    if (newSkill.name && newSkill.proficiency && newSkill.yearsOfExperience) {
      onTechnicalSkillsChange([...technicalSkills, newSkill as TechnicalSkill])
      setNewSkill({})
    }
  }

  const removeTechnicalSkill = (index: number) => {
    const updatedSkills = [...technicalSkills]
    updatedSkills.splice(index, 1)
    onTechnicalSkillsChange(updatedSkills)
  }

  const addCertification = () => {
    if (newCert.name && newCert.issuer && newCert.dateObtained) {
      onCertificationsChange([...certifications, {
        ...newCert,
        isActive: newCert.isActive ?? true
      } as Certification])
      setNewCert({})
    }
  }

  const removeCertification = (index: number) => {
    const updatedCerts = [...certifications]
    updatedCerts.splice(index, 1)
    onCertificationsChange(updatedCerts)
  }

  return (
    <div className="space-y-6">
      {/* Technical Skills Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Technical Skills</h3>
        
        <div className="grid gap-4 mb-4">
          {technicalSkills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="font-medium">{skill.name}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {skill.proficiency} • {skill.yearsOfExperience} years
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTechnicalSkill(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            value={newSkill.name || ''}
            onValueChange={(value) => setNewSkill({ ...newSkill, name: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Skill" />
            </SelectTrigger>
            <SelectContent>
              {TECHNICAL_SKILLS.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newSkill.proficiency || ''}
            onValueChange={(value) => setNewSkill({ 
              ...newSkill, 
              proficiency: value as TechnicalSkill['proficiency']
            })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Proficiency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="0"
            max="30"
            placeholder="Years of Experience"
            value={newSkill.yearsOfExperience || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSkill({
              ...newSkill,
              yearsOfExperience: parseInt(e.target.value) || 0
            })}
          />
        </div>

        <Button
          onClick={addTechnicalSkill}
          disabled={!newSkill.name || !newSkill.proficiency || !newSkill.yearsOfExperience}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Technical Skill
        </Button>
      </div>

      {/* Certifications Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Certifications</h3>
        
        <div className="grid gap-4 mb-4">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="font-medium">{cert.name}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {cert.issuer} • {new Date(cert.dateObtained).toLocaleDateString()}
                  {cert.expirationDate && ` - ${new Date(cert.expirationDate).toLocaleDateString()}`}
                </span>
                <Badge 
                  variant={cert.isActive ? "default" : "secondary"}
                  className="ml-2"
                >
                  {cert.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCertification(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            value={newCert.name || ''}
            onValueChange={(value) => setNewCert({ ...newCert, name: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Certification" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_CERTIFICATIONS.map((cert) => (
                <SelectItem key={cert} value={cert}>
                  {cert}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Issuing Organization"
            value={newCert.issuer || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCert({ ...newCert, issuer: e.target.value })}
          />

          <Input
            type="date"
            placeholder="Date Obtained"
            value={newCert.dateObtained || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCert({ ...newCert, dateObtained: e.target.value })}
          />

          <Input
            type="date"
            placeholder="Expiration Date (Optional)"
            value={newCert.expirationDate || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCert({ ...newCert, expirationDate: e.target.value })}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="mr-2"
              checked={newCert.isActive ?? true}
              onChange={(e) => setNewCert({ ...newCert, isActive: e.target.checked })}
            />
            <label htmlFor="isActive">Certification is Active</label>
          </div>
        </div>

        <Button
          onClick={addCertification}
          disabled={!newCert.name || !newCert.issuer || !newCert.dateObtained}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>
    </div>
  )
} 