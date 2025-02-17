'use client'

import { Shield, Briefcase, TrendingUp, FileText, Award, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              About BridgeSkills
            </h1>
            <p className="text-xl text-gray-600">
              Empowering military personnel to discover their perfect civilian career path through 
              data-driven insights and personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">How It Works</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">1</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Enter Your Military Background</h3>
                    <p className="text-gray-600">
                      Input your MOS/AFSC, skills, and experience. You can either enter this manually 
                      or upload your resume for automatic extraction.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Get Personalized Recommendations</h3>
                    <p className="text-gray-600">
                      Our AI-powered system analyzes your background and matches you with civilian 
                      roles that align with your skills and experience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Explore Career Insights</h3>
                    <p className="text-gray-600">
                      View detailed salary information, industry trends, and growth opportunities 
                      for each recommended role.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-lg border border-gray-100">
                  <Shield className="w-8 h-8 text-primary-600 mb-4" />
                  <h3 className="font-semibold mb-2">Military Skill Translation</h3>
                  <p className="text-gray-600">
                    Advanced AI mapping of military experience to civilian roles, highlighting your 
                    transferable skills.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-100">
                  <Briefcase className="w-8 h-8 text-primary-600 mb-4" />
                  <h3 className="font-semibold mb-2">Personalized Job Matches</h3>
                  <p className="text-gray-600">
                    Get matched with civilian roles that align with your MOS/AFSC, skills, and 
                    experience level.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-100">
                  <TrendingUp className="w-8 h-8 text-primary-600 mb-4" />
                  <h3 className="font-semibold mb-2">Market Insights</h3>
                  <p className="text-gray-600">
                    Access real-time salary data, job demand trends, and industry growth 
                    opportunities.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-100">
                  <Award className="w-8 h-8 text-primary-600 mb-4" />
                  <h3 className="font-semibold mb-2">Career Development</h3>
                  <p className="text-gray-600">
                    Get recommendations for certifications and skills that can enhance your 
                    civilian career prospects.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="mb-16">
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
                <Lock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Privacy & Security</h3>
                  <p className="text-gray-600">
                    Your privacy and data security are our top priorities. We do not store your resume 
                    or personal information permanently. All data is processed securely and used only 
                    for generating your career recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Is this service free?</h3>
                  <p className="text-gray-600">
                    Yes, BridgeSkills is completely free to use. You can generate career recommendations 
                    and access all features without any cost.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">How accurate are the recommendations?</h3>
                  <p className="text-gray-600">
                    Our recommendations are based on advanced AI analysis of your skills and experience, 
                    combined with real-world job market data. While no system is perfect, we continuously 
                    improve our algorithms to provide the most accurate matches possible.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Do I need to create an account?</h3>
                  <p className="text-gray-600">
                    No, you can use BridgeSkills without creating an account. However, signing in with 
                    Google allows you to save your results and access them later.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center py-12 px-6 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 rounded-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Start Your Civilian Career Journey?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of veterans who have successfully transitioned to civilian careers. 
                Get your personalized career recommendations today.
              </p>
              <Link 
                href="/career-match"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 