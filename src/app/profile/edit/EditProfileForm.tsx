'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Loader2, X, Plus } from 'lucide-react'

interface EditProfileFormProps {
  profile: Profile
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [fullName, setFullName] = useState(profile.fullName || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [department, setDepartment] = useState(profile.department || '')
  const [year, setYear] = useState(profile.year || '')
  const [skills, setSkills] = useState<string[]>(profile.skills || [])
  const [interests, setInterests] = useState<string[]>(profile.interests || [])
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim()
    
    if (!trimmedSkill) return
    
    if (trimmedSkill.length > 50) {
      setError('Skill name too long (max 50 characters)')
      return
    }
    
    if (skills.length >= 20) {
      setError('Maximum 20 skills allowed')
      return
    }
    
    if (skills.includes(trimmedSkill)) {
      setError('This skill already exists')
      return
    }
    
    setSkills([...skills, trimmedSkill])
    setNewSkill('')
    setError('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleAddInterest = () => {
    const trimmedInterest = newInterest.trim()
    
    if (!trimmedInterest) return
    
    if (trimmedInterest.length > 50) {
      setError('Interest name too long (max 50 characters)')
      return
    }
    
    if (interests.length >= 20) {
      setError('Maximum 20 interests allowed')
      return
    }
    
    if (interests.includes(trimmedInterest)) {
      setError('This interest already exists')
      return
    }
    
    setInterests([...interests, trimmedInterest])
    setNewInterest('')
    setError('')
  }

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSubmitting(true)

    // Comprehensive Validation
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters')
      setIsSubmitting(false)
      return
    }

    if (fullName.trim().length > 100) {
      setError('Full name must be less than 100 characters')
      setIsSubmitting(false)
      return
    }

    if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      setError('Full name can only contain letters, spaces, hyphens and apostrophes')
      setIsSubmitting(false)
      return
    }

    if (bio.length > 500) {
      setError('Bio must be less than 500 characters')
      setIsSubmitting(false)
      return
    }

    if (skills.length > 20) {
      setError('Maximum 20 skills allowed')
      setIsSubmitting(false)
      return
    }

    if (interests.length > 20) {
      setError('Maximum 20 interests allowed')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          bio,
          department,
          year,
          skills,
          interests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          onClick={() => router.push('/profile')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <h1
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Edit Profile
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
          Update your information and preferences
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Full Name *
          </label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="glass-input"
            required
            minLength={2}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="glass-input w-full min-h-[100px] resize-y"
            placeholder="Tell us about yourself..."
            maxLength={500}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
            {bio.length}/500 characters
          </p>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="glass-input w-full"
          >
            <option value="">Select department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Management Sciences">Management Sciences</option>
            <option value="Economics">Economics</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="English">English</option>
            <option value="Psychology">Psychology</option>
            <option value="Sociology">Sociology</option>
            <option value="Political Science">Political Science</option>
            <option value="Media Studies">Media Studies</option>
            <option value="Architecture">Architecture</option>
            <option value="Design">Design</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Academic Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="glass-input w-full"
          >
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="Graduate">Graduate</option>
            <option value="PhD">PhD</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Skills
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              className="glass-input flex-1"
              placeholder="Add a skill..."
              maxLength={50}
            />
            <Button
              type="button"
              onClick={handleAddSkill}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="glass-card px-3 py-1 flex items-center gap-2 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Interests
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              className="glass-input flex-1"
              placeholder="Add an interest..."
              maxLength={50}
            />
            <Button
              type="button"
              onClick={handleAddInterest}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <div
                key={index}
                className="glass-card px-3 py-1 flex items-center gap-2 text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-green-800">
            ✅ Profile updated successfully! Redirecting...
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-gradient flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/profile')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

