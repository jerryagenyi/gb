import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Research() {
  const { research } = site;
  return (
    <section id="research">
      <div className="wrap">
        <p className="sec-label reveal">{research.label}</p>
        <h2 className="sec-title reveal">{research.title}</h2>
        <div className="research-list">
          {research.items.map((item) => (
            <div className="research-item reveal" key={item.tag}>
              <span className="research-tag">{item.tag}</span>
              <div>
                <h3>
                  <RichText value={item.title} />
                </h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
