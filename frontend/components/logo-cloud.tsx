import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";

export function LogoCloud() {
  return (
    <div
      className="w-full max-w-6xl mx-auto overflow-hidden py-6"
      style={{
        // Light fade only at the extreme edges
        maskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
      }}
    >
      <InfiniteSlider gap={64} reverse speed={60} speedOnHover={20}>
        {logos.map((logo, index) => (
          <div
            key={`logo-${logo.alt}-${index}`}
            className="
              flex
              shrink-0
              items-center
              justify-center
              h-16
              sm:h-18
              md:h-20
              px-4
              transition-transform
              duration-300
              hover:scale-110
            "
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="
                pointer-events-none
                h-11
                sm:h-12
                md:h-14
                w-auto
                max-w-[150px]
                object-contain
                select-none
                opacity-100
              "
              loading="eager"
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
    alt: "NVIDIA Logo",
  },
  {
    src: "https://cdn.simpleicons.org/supabase/3ECF8E",
    alt: "Supabase Logo",
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
    alt: "Anthropic Logo",
  },
  {
    src: "https://cdn.simpleicons.org/clerk/6C47FF",
    alt: "Clerk Logo",
  },
];
