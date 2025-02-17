export type ServiceType = 'Officer' | 'Enlisted'

export const SERVICE_TYPES: ServiceType[] = ['Officer', 'Enlisted']

export const MILITARY_RANKS = {
  Officer: [
    'O-1',
    'O-2',
    'O-3',
    'O-4',
    'O-5',
    'O-6'
  ],
  Enlisted: [
    'E-1',
    'E-2',
    'E-3',
    'E-4',
    'E-5',
    'E-6',
    'E-7',
    'E-8',
    'E-9'
  ]
} as const

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
  serviceType: ServiceType
}

// Common Cyber, Intelligence, and Technical AFSCs/MOSs
export const MILITARY_CODES: MilitaryCode[] = [
  // Air Force
  { code: '17S_AF', title: 'Cyber Warfare Operations Officer', branch: 'Air Force', serviceType: 'Officer' },
  { code: '1B4', title: 'Cyber Warfare Operations', branch: 'Air Force', serviceType: 'Officer' },
  { code: '3D0', title: 'Cyberspace Operations', branch: 'Air Force', serviceType: 'Officer' },
  { code: '14N', title: 'Intelligence Officer', branch: 'Air Force', serviceType: 'Officer' },
  { code: '1N0', title: 'All Source Intelligence Analyst', branch: 'Air Force', serviceType: 'Officer' },
  { code: '1N4', title: 'Fusion Analyst', branch: 'Air Force', serviceType: 'Officer' },
  
  // Army
  { code: '17A', title: 'Cyber Operations Officer', branch: 'Army', serviceType: 'Officer' },
  { code: '17C', title: 'Cyber Operations Specialist', branch: 'Army', serviceType: 'Officer' },
  { code: '25B', title: 'Information Technology Specialist', branch: 'Army', serviceType: 'Officer' },
  { code: '35F', title: 'Intelligence Analyst', branch: 'Army', serviceType: 'Officer' },
  { code: '35D', title: 'All Source Intelligence Officer', branch: 'Army', serviceType: 'Officer' },
  { code: '255A', title: 'Information Services Technician', branch: 'Army', serviceType: 'Officer' },
  
  // Navy
  { code: '1810', title: 'Cryptologic Warfare Officer', branch: 'Navy', serviceType: 'Officer' },
  { code: 'CTN', title: 'Cryptologic Technician Networks', branch: 'Navy', serviceType: 'Officer' },
  { code: 'IT', title: 'Information Systems Technician', branch: 'Navy', serviceType: 'Officer' },
  { code: 'IS', title: 'Intelligence Specialist', branch: 'Navy', serviceType: 'Officer' },
  { code: '1830', title: 'Intelligence Officer', branch: 'Navy', serviceType: 'Officer' },
  
  // Marine Corps
  { code: '0650', title: 'Cyberspace Operations Officer', branch: 'Marine Corps', serviceType: 'Officer' },
  { code: '0651', title: 'Cyber Network Operator', branch: 'Marine Corps', serviceType: 'Officer' },
  { code: '0211', title: 'Counterintelligence/Human Intelligence Specialist', branch: 'Marine Corps', serviceType: 'Enlisted' },
  { code: '0231', title: 'Intelligence Specialist', branch: 'Marine Corps', serviceType: 'Enlisted' },
  { code: '0202', title: 'Intelligence Officer', branch: 'Marine Corps', serviceType: 'Officer' },
  
  // Space Force
  { code: '17S_SF', title: 'Cyber Warfare Operations Officer', branch: 'Space Force', serviceType: 'Officer' },
  { code: '5C0', title: 'Cyber Operations Specialist', branch: 'Space Force', serviceType: 'Officer' },
  { code: '5I0', title: 'Intelligence Officer', branch: 'Space Force', serviceType: 'Officer' },
  
  // Marine Corps
  { code: '0671', title: 'Data Systems Administrator', branch: 'Marine Corps', serviceType: 'Enlisted' },
  { code: '0689', title: 'Cybersecurity Technician', branch: 'Marine Corps', serviceType: 'Enlisted' },
  
  // Army
  { code: '35N', title: 'Signals Intelligence Analyst', branch: 'Army', serviceType: 'Officer' },
] as const

export const COMMON_MILITARY_SKILLS = [
  // Leadership & Management
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
  
  // Cyber & Technical
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
  
  // Intelligence & Analysis
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
  
  // General Skills
  'Problem Solving',
  'Communication',
  'Technical Writing',
  'Critical Thinking',
  'Research',
  'Documentation',
  'Quality Assurance',
  'Policy Development',
  'Cross-functional Coordination',
  'Requirements Analysis'
] as const

export type MilitaryRank = typeof MILITARY_RANKS.Officer[number] | typeof MILITARY_RANKS.Enlisted[number]
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

export const TECHNICAL_SKILLS = [
  // Programming Languages
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'C#',
  'Go',
  'Ruby',
  'PHP',
  'Swift',
  
  // Cloud & Infrastructure
  'AWS',
  'Azure',
  'Google Cloud',
  'Docker',
  'Kubernetes',
  'Terraform',
  
  // Security
  'Network Security',
  'Penetration Testing',
  'Security Information and Event Management (SIEM)',
  'Vulnerability Assessment',
  'Incident Response',
  'Threat Analysis',
  
  // Data & Analytics
  'SQL',
  'Machine Learning',
  'Data Analysis',
  'Power BI',
  'Tableau',
  'Big Data',
  
  // DevOps & Tools
  'Git',
  'Jenkins',
  'CI/CD',
  'Linux',
  'Shell Scripting',
  'Ansible'
] as const

export const COMMON_CERTIFICATIONS = [
  // Security
  'CompTIA Security+',
  'Certified Information Systems Security Professional (CISSP)',
  'Certified Ethical Hacker (CEH)',
  'GIAC Security Essentials (GSEC)',
  'Certified Information Security Manager (CISM)',
  
  // Cloud
  'AWS Certified Solutions Architect',
  'AWS Certified Security - Specialty',
  'Microsoft Azure Administrator',
  'Google Cloud Professional Cloud Architect',
  
  // Project Management
  'Project Management Professional (PMP)',
  'Certified Scrum Master (CSM)',
  'PRINCE2 Foundation/Practitioner',
  'PMI Agile Certified Practitioner (PMI-ACP)',
  
  // IT Service Management
  'ITIL Foundation',
  'ITIL Intermediate',
  
  // Technical
  'Cisco Certified Network Associate (CCNA)',
  'Cisco Certified Network Professional (CCNP)',
  'Red Hat Certified Engineer (RHCE)',
  'CompTIA A+',
  'CompTIA Network+'
] as const

export type TechnicalSkill = typeof TECHNICAL_SKILLS[number]
export type Certification = typeof COMMON_CERTIFICATIONS[number] 