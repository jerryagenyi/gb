import { Button } from '@/components/Button';
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Hero() {
  const { hero } = site;
  return (
    <header className="hero" id="top">
      <div className="wrap">
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
    </header>
  );
}
