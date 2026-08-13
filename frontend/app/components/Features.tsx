import { FeatureSection } from '@/components/feature-section'
import { Status, StatusIndicator, StatusLabel } from '@/components/kibo-ui/status'
import React from 'react'

const Features = () => {
  return (
    <section className='w-full max-w-full overflow-hidden bg-[#F8F8F8] py-16 sm:py-24 border-y border-gray-200/50'>
      <div className='flex items-center justify-center flex-col gap-6 sm:gap-8 mb-12 sm:mb-15 mt-6 sm:mt-8 md:mt-10'>
        <Status status="maintenance" className="border-neutral-200 shadow-sm font-manrope px-4 py-1.5 rounded-full flex items-center gap-2.5 bg-white">
          <StatusIndicator className="h-2.5 w-2.5" />
          <StatusLabel className="text-xs sm:text-sm font-semibold text-neutral-800 tracking-wide">Features</StatusLabel>
        </Status>

        <div className="flex items-center justify-center  flex-col text-center gap-2">
          <h2 className="text-3xl  font-medium tracking-tight text-gray-900 font-manrope">
            Everything you need to build a resume
          </h2>

          <p className="text-gray-600 font-inter text-center max-w-2xl">
            Craft professional resumes faster and increase your chances of getting hired.
          </p>
        </div>
      </div>

      <div>
        <FeatureSection/>
      </div>
    </section>
  )
}

export default Features