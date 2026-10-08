import { Fragment } from 'react';

export type Segment = string | { em: string } | { strong: string };
export type Rich = Segment[];

export function RichText({ value }: { value: Rich }) {
  return (
    <>
      {value.map((s, i) =>
        typeof s === 'string' ? (
          <Fragment key={i}>{s}</Fragment>
        ) : 'em' in s ? (
          <em key={i}>{s.em}</em>
        ) : (
          <strong key={i}>{s.strong}</strong>
        ),
      )}
    </>
  );
}
