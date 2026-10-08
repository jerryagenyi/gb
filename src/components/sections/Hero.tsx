import Image from 'next/image';
import { Button } from '@/components/Button';
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Hero() {
  const { hero } = site;
  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-text">
          <p className="eyebrow reveal">{hero.eyebrow}</p>
          <h1 className="reveal">
            <RichText value={hero.title} />
          </h1>
          <p className="hero-lead reveal">{hero.lead}</p>
          <div className="hero-cta reveal">
            {hero.ctas.map((c) => (
              <Button key={c.href} {...c} />
            ))}
          </div>
        </div>
        <figure className="hero-portrait reveal">
          <Image
            src={hero.portrait.src}
            alt={hero.portrait.alt}
            width={hero.portrait.width}
            height={hero.portrait.height}
            sizes="(max-width: 760px) 90vw, 400px"
            priority
          />
        </figure>
      </div>
    </header>
  );
}
