import { site } from '@/content/site';

export function Nav() {
  return (
    <nav>
      <div className="nav-inner">
        <a href="#top" className="brand">
          {site.brand.first} <span>{site.brand.last}</span>
        </a>
        <ul className="nav-links">
          {site.nav.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
