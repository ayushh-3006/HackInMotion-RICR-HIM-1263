import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";

export function LogoCloud() {
  return (
    <div 
      className="w-full max-w-5xl mx-auto overflow-hidden py-4"
      style={{
        maskImage: "linear-gradient(to right, transparent, black, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black, transparent)",
      }}
    >
      <InfiniteSlider gap={56} reverse speed={60} speedOnHover={20}>
        {logos.map((logo, index) => (
          <div 
            key={`logo-${logo.alt}-${index}`} 
            className="flex items-center justify-center h-12 px-2 transition-transform duration-300 hover:scale-110"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="pointer-events-none h-8 md:h-10 w-auto object-contain select-none transition-opacity duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}

const logos = [
  {
    src: "https://cdn.simpleicons.org/nvidia/76B900",
    alt: "Nvidia Logo",
  },
  {
    src: "https://cdn.simpleicons.org/supabase/3ECF8E",
    alt: "Supabase Logo",
  },
  {
    src: "https://cdn.simpleicons.org/openai/10A37F",
    alt: "OpenAI Logo",
  },
  {
    src: "https://cdn.simpleicons.org/turso/4FF8D2",
    alt: "Turso Logo",
  },
  {
    src: "https://cdn.simpleicons.org/vercel/000000",
    alt: "Vercel Logo",
  },
  {
    src: "https://cdn.simpleicons.org/github/181717",
    alt: "GitHub Logo",
  },
  {
    src: "https://cdn.simpleicons.org/anthropic/D97757",
    alt: "Claude AI Logo",
  },
  {
    src: "https://cdn.simpleicons.org/clerk/6C47FF",
    alt: "Clerk Logo",
  },
];