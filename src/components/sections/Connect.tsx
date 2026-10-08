import { Button } from '@/components/Button';
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Connect() {
  const { connect } = site;
  return (
    <section className="cta-strip" id="connect">
      <div className="wrap reveal">
        <h2>
          <RichText value={connect.title} />
        </h2>
        <p>{connect.text}</p>
        <div className="hero-cta" style={{ justifyContent: 'center' }}>
          {connect.ctas.map((c) => (
            <Button key={c.href} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}
