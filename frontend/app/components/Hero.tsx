"use client"
import HoverBorderGradientDemo from '@/components/hover-border-gradient-demo'
import ShinyText from '@/components/ShinyText'
import ButtonWithIconDemo from '@/components/Buttons/button-witn-icon'
import { Button } from '@/components/Buttons/button'
import React from 'react'
import Image from 'next/image'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { LogoCloud } from '@/components/logo-cloud'
import { Glitter } from '@/components/ui/glitter'


const Hero = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden relative pb-6 sm:pb-10">

      {/* Base background color */}
      <div className="absolute inset-0 z-0 bg-white" />

      {/* Dotted pattern with linear fade-out mask */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.15) 1px, transparent 0)",
          backgroundSize: "20px 20px",
          maskImage: "linear-gradient(to bottom, black 10%, transparent 60%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 10%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-full flex flex-col items-center justify-center">


        <div className="absolute top-[40%] md:top-[50%] left-1/2 -translate-x-1/2 w-full max-w-full -z-10 flex justify-center items-center pointer-events-none select-none -mt-60 overflow-hidden">

          <div className="relative w-full max-w-7xl flex justify-center">

            {/* Glow Image */}
            <Image
              src="/Hero/Blue.webp"
              alt="Blue Dashboard Glow"
              width={6914}
              height={5050}
              sizes="100vw"
              quality={100}
              className="w-full h-auto object-contain scale-[1.1]"
              priority
            />

            {/* ✨ Glitter Layer */}
            <div className="absolute inset-0 pointer-events-none w-full h-full">
               <Glitter density={0.08} size={1.2} />
            </div>

          </div>
        </div>

        <ContainerScroll
          titleComponent={
            <div className='flex flex-col items-center justify-center w-full px-4 gap-8 mb-8 md:mb-24 mt-60'>
              <div className="">
                <HoverBorderGradientDemo />
              </div>

              <div className='flex flex-col items-center justify-center text-center gap-6'>
                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold max-w-2xl tracking-tight text-neutral-900 font-manrope'>
                  Build Smarter Resumes. Get Hired Faster{" "}
                  <span>
                    <ShinyText
                      text=" with AI"
                      speed={2}
                      delay={0}
                      color="#1C4ED6"
                      shineColor="#ffffff"
                      spread={120}
                      direction="left"
                      yoyo={false}
                      pauseOnHover={false}
                      disabled={false}
                    />
                  </span>
                </h1>
                <p className='text-sm md:text-lg max-w-2xl text-neutral-600 font-light px-2'>
                  Create, optimize, and analyze your resume with AI-powered tools from ATS scoring to role-based enhancements, all in one place.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4'>
                <ButtonWithIconDemo />
                <Button variant="outline" className="text-[#1C4ED6] cursor-pointer rounded-full h-12 px-8 font-manrope font-medium border-[#1C4ED6] hover:bg-[#1C4ED6] hover:text-white transition-all duration-300">
                  Learn More
                </Button>
              </div>
            </div>
          }
        >
          <Image
            src={`/Hero/Dashboard.png`}
            alt="hero dashboard screenshot"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top border border-neutral-200 dark:border-white/10"
            draggable={false}
          />
        </ContainerScroll>
      </div>

      <section className="relative z-10 w-full flex flex-col items-center justify-center mt-48 sm:mt-56 md:mt-64">
        <h2 className="mb-5 md:mb-6 text-center text-neutral-700 dark:text-neutral-300 text-lg sm:text-xl md:text-2xl font-semibold tracking-tight font-manrope">
          Helping users land roles at top companies
        </h2>

        <LogoCloud />
      </section>

    </div>
  )
}

export default Hero