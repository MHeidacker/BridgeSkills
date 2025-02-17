'use client'

import { militaryCodes } from '@/data/military-codes'

export function MilitaryCodeSelector() {
  return (
    <select className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
      <option value="">Select a Military Code</option>
      {militaryCodes.map((code) => (
        <option key={code.code} value={code.code}>
          {code.branch} - {code.code.split('_')[0]} - {code.title}
        </option>
      ))}
    </select>
  )
} 