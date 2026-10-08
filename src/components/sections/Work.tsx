import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Work() {
  const { work } = site;
  return (
    <section id="work">
      <div className="wrap">
        <p className="sec-label reveal">{work.label}</p>
        <h2 className="sec-title reveal">
          <RichText value={work.title} />
        </h2>
        <div className="pillars">
          {work.pillars.map((p) => (
            <div className="pillar reveal" key={p.num}>
              <span className="pillar-num">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
