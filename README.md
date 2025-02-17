# BridgeSkills - Military to Civilian Career Transition

BridgeSkills is a web application designed to help military personnel transition into civilian careers by analyzing their skills and experience, particularly in cyber, intelligence, and program/product management fields.

## Features

- **Resume Upload & Analysis**: Upload your military resume for automatic skill extraction
- **Manual Data Entry**: Input your military background, skills, and experience manually
- **Standardized Military Information**:
  - Uses standardized pay grades (E1-E9, O1-O6)
  - Comprehensive MOS/AFSC database
  - Branch-specific role mapping
- **Skill Translation**: Maps military skills to civilian equivalents
- **Career Recommendations**: Provides tailored job recommendations with:
  - Salary insights
  - Industry demand trends
  - Required skills
  - Location opportunities

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **State Management**: React Hooks
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bridge-skills.git
   cd bridge-skills
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profile pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── lib/                  # Utilities and types
│   ├── constants.ts      # Military data constants
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── styles/               # Global styles
```

## Development Process

1. **Authentication & User Management**
   - Implemented Google OAuth using Supabase
   - Added user profile management

2. **Data Input**
   - Created form components for manual data entry
   - Implemented resume upload and processing
   - Added military information validation

3. **UI/UX**
   - Designed responsive layouts
   - Added loading states and error handling
   - Implemented smooth transitions

4. **Military Data**
   - Standardized rank system
   - Created comprehensive MOS/AFSC database
   - Added branch-specific role mapping

5. **Job Recommendations**
   - Implemented skill mapping algorithm
   - Added salary and trend analysis
   - Created detailed job matching system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Military rank and MOS/AFSC data sourced from official military documentation
- Salary and job trend data powered by industry APIs
- UI components inspired by modern design systems