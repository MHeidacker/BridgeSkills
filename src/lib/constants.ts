export const MILITARY_RANKS = [
  // Enlisted
  'E-1',
  'E-2',
  'E-3',
  'E-4',
  'E-5',
  'E-6',
  'E-7',
  'E-8',
  'E-9',
  // Officers
  'O-1',
  'O-2',
  'O-3',
  'O-4',
  'O-5',
  'O-6',
] as const

export const MILITARY_BRANCHES = [
  'Air Force',
  'Army',
  'Navy',
  'Marine Corps',
  'Coast Guard',
  'Space Force',
] as const

export type MilitaryBranch = 'Air Force' | 'Army' | 'Navy' | 'Marine Corps' | 'Space Force'
export type MilitaryCode = {
  code: string
  title: string
  branch: MilitaryBranch
}

// Common Cyber, Intelligence, and Technical AFSCs/MOSs
export const MILITARY_CODES: Array<MilitaryCode> = [
  // Air Force
  { code: '17S_AF', title: 'Cyber Warfare Operations Officer', branch: 'Air Force' },
  { code: '1B4', title: 'Cyber Warfare Operations', branch: 'Air Force' },
  { code: '3D0', title: 'Cyberspace Operations', branch: 'Air Force' },
  { code: '14N', title: 'Intelligence Officer', branch: 'Air Force' },
  { code: '1N0', title: 'All Source Intelligence Analyst', branch: 'Air Force' },
  { code: '1N4', title: 'Fusion Analyst', branch: 'Air Force' },
  
  // Army
  { code: '17A', title: 'Cyber Operations Officer', branch: 'Army' },
  { code: '17C', title: 'Cyber Operations Specialist', branch: 'Army' },
  { code: '25B', title: 'Information Technology Specialist', branch: 'Army' },
  { code: '35F', title: 'Intelligence Analyst', branch: 'Army' },
  { code: '35D', title: 'All Source Intelligence Officer', branch: 'Army' },
  { code: '255A', title: 'Information Services Technician', branch: 'Army' },
  
  // Navy
  { code: '1810', title: 'Cryptologic Warfare Officer', branch: 'Navy' },
  { code: 'CTN', title: 'Cryptologic Technician Networks', branch: 'Navy' },
  { code: 'IT', title: 'Information Systems Technician', branch: 'Navy' },
  { code: 'IS', title: 'Intelligence Specialist', branch: 'Navy' },
  { code: '1830', title: 'Intelligence Officer', branch: 'Navy' },
  
  // Marine Corps
  { code: '0650', title: 'Cyberspace Operations Officer', branch: 'Marine Corps' },
  { code: '0651', title: 'Cyber Network Operator', branch: 'Marine Corps' },
  { code: '0211', title: 'Counterintelligence/Human Intelligence Specialist', branch: 'Marine Corps' },
  { code: '0231', title: 'Intelligence Specialist', branch: 'Marine Corps' },
  { code: '0202', title: 'Intelligence Officer', branch: 'Marine Corps' },
  
  // Space Force
  { code: '17S_SF', title: 'Cyber Warfare Operations Officer', branch: 'Space Force' },
  { code: '5C0', title: 'Cyber Operations Specialist', branch: 'Space Force' },
  { code: '5I0', title: 'Intelligence Officer', branch: 'Space Force' },
  
  // Marine Corps
  { code: '0671', title: 'Data Systems Administrator', branch: 'Marine Corps' },
  { code: '0689', title: 'Cybersecurity Technician', branch: 'Marine Corps' },
  
  // Army
  { code: '35N', title: 'Signals Intelligence Analyst', branch: 'Army' },
] as const

export const COMMON_MILITARY_SKILLS = [
  'Leadership',
  'Project Management',
  'Team Building',
  'Strategic Planning',
  'Risk Management',
  'Cybersecurity',
  'Network Security',
  'Intelligence Analysis',
  'Data Analysis',
  'System Administration',
  'Information Security',
  'Operations Management',
  'Training & Development',
  'Problem Solving',
  'Communication',
  'Technical Writing',
] as const

export type MilitaryRank = typeof MILITARY_RANKS[number]
export type MilitarySkill = typeof COMMON_MILITARY_SKILLS[number]

// Helper function to get rank description
export function getRankDescription(rank: MilitaryRank): string {
  const rankDescriptions: Record<MilitaryRank, string> = {
    'E-1': 'Private/Airman Basic/Seaman Recruit',
    'E-2': 'Private/Airman/Seaman Apprentice',
    'E-3': 'Private First Class/Airman First Class/Seaman',
    'E-4': 'Corporal-Specialist/Senior Airman/Petty Officer 3rd Class',
    'E-5': 'Sergeant/Staff Sergeant/Petty Officer 2nd Class',
    'E-6': 'Staff Sergeant/Technical Sergeant/Petty Officer 1st Class',
    'E-7': 'Sergeant First Class/Master Sergeant/Chief Petty Officer',
    'E-8': 'Master Sergeant-First Sergeant/Senior Master Sergeant/Senior Chief Petty Officer',
    'E-9': 'Sergeant Major/Chief Master Sergeant/Master Chief Petty Officer',
    'O-1': 'Second Lieutenant/Ensign',
    'O-2': 'First Lieutenant/Lieutenant Junior Grade',
    'O-3': 'Captain/Lieutenant',
    'O-4': 'Major/Lieutenant Commander',
    'O-5': 'Lieutenant Colonel/Commander',
    'O-6': 'Colonel/Captain',
  }
  return rankDescriptions[rank]
} 