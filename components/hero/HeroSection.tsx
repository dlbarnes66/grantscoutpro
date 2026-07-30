import HeroLeft from "./HeroLeft";
import HeroRightInteractive from "./HeroRightInteractive";

export default function HeroSection() {
  return (
    <section className="w-full min-h-[90vh] bg-[#0A1A2F] flex items-center justify-center px-12 py-24">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        <HeroLeft />
        <HeroRightInteractive />
      </div>
    </section>
  );
}
