import { site } from '@/content/site';

export function Footer() {
  const { brand, footer } = site;
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-brand">
              {brand.first} <span>{brand.last}</span>
            </div>
            <p className="foot-tag">{footer.tagline}</p>
          </div>
          <div className="foot-links">
            <div className="foot-col">
              <h5>Explore</h5>
              {footer.explore.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="foot-col">
              <h5>Connect</h5>
              {footer.connect.map((l) =>
                l.external ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener">
                    {l.label}
                  </a>
                ) : (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
        <div className="foot-bottom">{footer.copyright}</div>
      </div>
    </footer>
  );
}
