'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Briefcase, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Transform Your Military Experience into Civilian Success
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover how your military background translates to in-demand civilian careers. 
              Get personalized job matches, salary insights, and industry trends.
            </p>
            <Link 
              href="/career-match"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-6">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Military Skill Translation
                </h3>
                <p className="text-gray-600">
                  Our advanced AI maps your military experience to civilian roles, highlighting your transferable skills.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-6">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Personalized Job Matches
                </h3>
                <p className="text-gray-600">
                  Get matched with civilian roles that align with your MOS/AFSC, skills, and experience level.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-6">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Market Insights
                </h3>
                <p className="text-gray-600">
                  Access real-time salary data, job demand trends, and industry growth opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Civilian Career Journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of veterans who have successfully transitioned to civilian careers using our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/career-match"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try It Now - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/about"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
