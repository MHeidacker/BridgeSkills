'use client'

import { cn } from '@/lib/utils'

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

export function PageContainer({
  children,
  maxWidth = 'xl',
  className,
  ...props
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
  }

  return (
    <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          maxWidthClasses[maxWidth],
          'mx-auto w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </main>
  )
} 