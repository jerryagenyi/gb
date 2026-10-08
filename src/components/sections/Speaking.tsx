import { Button } from '@/components/Button';
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Speaking() {
  const { speaking } = site;
  return (
    <section id="speaking" className="speaking">
      <div className="wrap">
        <p className="sec-label reveal">{speaking.label}</p>
        <h2 className="sec-title reveal">
          <RichText value={speaking.title} />
        </h2>
        <div className="speak-grid">
          <div className="speak-body reveal">
            {speaking.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <Button {...speaking.cta} style={{ marginTop: '1rem', display: 'inline-block' }} />
          </div>
          <ul className="speak-topics reveal">
            {speaking.topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
