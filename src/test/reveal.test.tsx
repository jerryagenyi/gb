import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RevealObserver } from '@/components/RevealObserver';

type IOCallback = (entries: { isIntersecting: boolean; target: Element }[]) => void;

function mockIO() {
  const observed: Element[] = [];
  let cb: IOCallback = () => {};
  const io = vi.fn(function (this: unknown, callback: IOCallback) {
    cb = callback;
    return { observe: (el: Element) => observed.push(el), unobserve: vi.fn(), disconnect: vi.fn() };
  });
  vi.stubGlobal('IntersectionObserver', io);
  return { observed, fire: (el: Element) => cb([{ isIntersecting: true, target: el }]) };
}

const markup = (
  <>
    <p className="reveal">a</p>
    <p className="reveal">b</p>
    <RevealObserver />
  </>
);

afterEach(() => vi.unstubAllGlobals());

describe('RevealObserver', () => {
  it('observes .reveal elements with staggered delays and reveals on intersect', () => {
    const { observed, fire } = mockIO();
    const { container } = render(markup);
    const els = container.querySelectorAll<HTMLElement>('.reveal');
    expect(observed).toHaveLength(2);
    expect(els[1].style.transitionDelay).toBe('70ms');
    fire(els[0]);
    expect(els[0].classList.contains('in')).toBe(true);
    expect(els[1].classList.contains('in')).toBe(false);
  });

  it('reveals everything immediately when reduced motion is preferred', () => {
    mockIO();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { container } = render(markup);
    container.querySelectorAll('.reveal').forEach((el) => expect(el.classList.contains('in')).toBe(true));
  });
});
