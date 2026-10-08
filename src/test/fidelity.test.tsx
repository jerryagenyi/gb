import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '@/app/page';

const TEXT_SELECTOR =
  'h1, h2, h3, h4, h5, p, li, a, .roles-track span, .foot-brand, .pillar-num, .research-tag';

const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

function designRoot(): ParentNode {
  const html = readFileSync(path.resolve(process.cwd(), 'design/gb.html'), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html').body;
}

const texts = (root: ParentNode) =>
  Array.from(root.querySelectorAll(TEXT_SELECTOR)).map((el) => norm(el.textContent)).sort();

const links = (root: ParentNode) =>
  Array.from(root.querySelectorAll('a')).map((a) => a.getAttribute('href')).sort();

const ids = (root: ParentNode) =>
  Array.from(root.querySelectorAll('[id]')).map((el) => el.id).sort();

describe('page matches design/gb.html', () => {
  it('renders exactly the design copy', () => {
    const { container } = render(<Home />);
    expect(texts(container)).toEqual(texts(designRoot()));
  });

  it('has exactly the design links', () => {
    const { container } = render(<Home />);
    expect(links(container)).toEqual(links(designRoot()));
  });

  it('has the design anchor ids', () => {
    const { container } = render(<Home />);
    expect(ids(container)).toEqual(ids(designRoot()));
  });
});
