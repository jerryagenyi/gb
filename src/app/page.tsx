import { About } from '@/components/sections/About';
import { Connect } from '@/components/sections/Connect';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Nav } from '@/components/sections/Nav';
import { Research } from '@/components/sections/Research';
import { Roles } from '@/components/sections/Roles';
import { Speaking } from '@/components/sections/Speaking';
import { Work } from '@/components/sections/Work';

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Roles />
      <About />
      <Work />
      <Research />
      <Speaking />
      <Connect />
      <Footer />
    </>
  );
}
