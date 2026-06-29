import { HeroSlider } from "@/components/aura/sections/HeroSlider";
import { CategoryShowcase } from "@/components/aura/sections/CategoryShowcase";
import { BrandMarquee } from "@/components/aura/sections/BrandMarquee";
import { FeaturedProducts } from "@/components/aura/sections/FeaturedProducts";
import { CuratedCollection } from "@/components/aura/sections/CuratedCollection";
import { TestimonialSection } from "@/components/aura/sections/TestimonialSection";
import { BrandValues } from "@/components/aura/sections/BrandValues";
import { PressSection } from "@/components/aura/sections/PressSection";
import { InstagramFeed } from "@/components/aura/sections/InstagramFeed";
import { RecentlyViewed } from "@/components/aura/commerce/RecentlyViewed";
import { NewsletterSection } from "@/components/aura/sections/NewsletterSection";
import { FAQSection } from "@/components/aura/sections/FAQSection";
import { RecommendedForYou } from "@/components/aura/personalization/RecommendedForYou";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <RecommendedForYou />
      <CategoryShowcase />
      <BrandMarquee />
      <FeaturedProducts />
      <CuratedCollection />
      <TestimonialSection />
      <BrandValues />
      <PressSection />
      <InstagramFeed />
      <RecentlyViewed />
      <NewsletterSection />
      <FAQSection />
    </>
  );
}
