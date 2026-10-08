import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function About() {
  const { about } = site;
  return (
    <section id="about">
      <div className="wrap">
        <p className="sec-label reveal">{about.label}</p>
        <div className="about-grid">
          <div className="about-body reveal">
            <h2 className="sec-title">{about.title}</h2>
            {about.body.map((p, i) => (
              <p key={i}>
                <RichText value={p} />
              </p>
            ))}
          </div>
          <aside className="about-side reveal">
            {about.side.flatMap((s) => [
              <h4 key={`${s.heading}-h`}>{s.heading}</h4>,
              <p key={`${s.heading}-p`}>{s.text}</p>,
            ])}
          </aside>
        </div>
      </div>
    </section>
  );
}
