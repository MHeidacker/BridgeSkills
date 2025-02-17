'use client'

export function JobRecommendationsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 w-64 bg-gray-200 rounded mb-8" />

      {/* Job Recommendations Skeletons */}
      <div className="grid gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
            </div>

            <div className="h-4 w-3/4 bg-gray-100 rounded mb-4" />
            <div className="h-4 w-2/3 bg-gray-100 rounded mb-6" />

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-32 bg-gray-100 rounded" />
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-6 w-20 bg-gray-100 rounded" />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 w-16 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Insights Skeleton */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-24 bg-gray-100 rounded" />
          </div>

          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-40 bg-gray-100 rounded" />
              ))}
            </div>
          </div>

          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-48 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 