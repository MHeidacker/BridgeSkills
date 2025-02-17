export interface MilitaryCode {
  code: string
  branch: 'Air Force' | 'Army' | 'Navy' | 'Marines' | 'Space Force'
  title: string
  description: string
  category: 'Cyber' | 'Intelligence' | 'Program Management' | 'Technical'
}

export const militaryCodes: MilitaryCode[] = [
  {
    code: '17S_AF',
    branch: 'Air Force',
    title: 'Cyber Warfare Operations',
    description: 'Operates cyberspace weapons systems and commands crews to accomplish cyberspace, training, and other missions.',
    category: 'Cyber'
  },
  {
    code: '17S_SF',
    branch: 'Space Force',
    title: 'Cyber Warfare Operations',
    description: 'Operates cyberspace weapons systems and commands crews to accomplish cyberspace, training, and other missions.',
    category: 'Cyber'
  },
  {
    code: '35N_AR',
    branch: 'Army',
    title: 'Signals Intelligence Analyst',
    description: 'Performs signals intelligence analysis and reports intelligence findings.',
    category: 'Intelligence'
  },
  {
    code: '0671_MC',
    branch: 'Marines',
    title: 'Data Systems Administrator',
    description: 'Installs, configures, and maintains data systems and networks.',
    category: 'Technical'
  },
  {
    code: 'CTN_NV',
    branch: 'Navy',
    title: 'Cryptologic Technician Networks',
    description: 'Performs cyber operations and signals intelligence.',
    category: 'Cyber'
  }
] 