import type { Config } from 'tailwindcss'
import { theme } from './src/lib/theme'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...theme.colors,
      },
      spacing: {
        ...theme.spacing,
      },
      borderRadius: {
        ...theme.borderRadius,
      },
    },
  },
  plugins: [],
}

export default config 