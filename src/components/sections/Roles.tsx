import { site } from '@/content/site';

export function Roles() {
  return (
    <div className="roles">
      <div className="roles-track">
        {site.roles.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
    </div>
  );
}
