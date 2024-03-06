import { StateFn } from "./types.ts";

export function pipeline<A extends string>(
  a: Promise<StateFn<A>>
): Promise<StateFn<A>>;
export function pipeline<A extends string, B extends string>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>
): Promise<StateFn<B>>;
export function pipeline<A extends string, B extends string, C extends string>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>
): Promise<StateFn<C>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>
): Promise<StateFn<D>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>
): Promise<StateFn<E>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>
): Promise<StateFn<F>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>
): Promise<StateFn<G>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>
): Promise<StateFn<H>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>
): Promise<StateFn<I>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>,
  j: (i: StateFn<I>) => Promise<StateFn<J>>
): Promise<StateFn<J>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string,
  K extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>,
  j: (i: StateFn<I>) => Promise<StateFn<J>>,
  k: (j: StateFn<J>) => Promise<StateFn<K>>
): Promise<StateFn<K>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string,
  K extends string,
  L extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>,
  j: (i: StateFn<I>) => Promise<StateFn<J>>,
  k: (j: StateFn<J>) => Promise<StateFn<K>>,
  l: (k: StateFn<K>) => Promise<StateFn<L>>
): Promise<StateFn<L>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string,
  K extends string,
  L extends string,
  M extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>,
  j: (i: StateFn<I>) => Promise<StateFn<J>>,
  k: (j: StateFn<J>) => Promise<StateFn<K>>,
  l: (k: StateFn<K>) => Promise<StateFn<L>>,
  m: (l: StateFn<L>) => Promise<StateFn<M>>
): Promise<StateFn<M>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string,
  K extends string,
  L extends string,
  M extends string,
  N extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>,
  j: (i: StateFn<I>) => Promise<StateFn<J>>,
  k: (j: StateFn<J>) => Promise<StateFn<K>>,
  l: (k: StateFn<K>) => Promise<StateFn<L>>,
  m: (l: StateFn<L>) => Promise<StateFn<M>>,
  n: (m: StateFn<M>) => Promise<StateFn<N>>
): Promise<StateFn<N>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string,
  K extends string,
  L extends string,
  M extends string,
  N extends string,
  O extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>,
  j: (i: StateFn<I>) => Promise<StateFn<J>>,
  k: (j: StateFn<J>) => Promise<StateFn<K>>,
  l: (k: StateFn<K>) => Promise<StateFn<L>>,
  m: (l: StateFn<L>) => Promise<StateFn<M>>,
  n: (m: StateFn<M>) => Promise<StateFn<N>>,
  o: (n: StateFn<N>) => Promise<StateFn<O>>
): Promise<StateFn<O>>;
export function pipeline<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string,
  K extends string,
  L extends string,
  M extends string,
  N extends string,
  O extends string,
  P extends string
>(
  a: Promise<StateFn<A>>,
  b: (a: StateFn<A>) => Promise<StateFn<B>>,
  c: (b: StateFn<B>) => Promise<StateFn<C>>,
  d: (c: StateFn<C>) => Promise<StateFn<D>>,
  e: (d: StateFn<D>) => Promise<StateFn<E>>,
  f: (e: StateFn<E>) => Promise<StateFn<F>>,
  g: (f: StateFn<F>) => Promise<StateFn<G>>,
  h: (g: StateFn<G>) => Promise<StateFn<H>>,
  i: (h: StateFn<H>) => Promise<StateFn<I>>,
  j: (i: StateFn<I>) => Promise<StateFn<J>>,
  k: (j: StateFn<J>) => Promise<StateFn<K>>,
  l: (k: StateFn<K>) => Promise<StateFn<L>>,
  m: (l: StateFn<L>) => Promise<StateFn<M>>,
  n: (m: StateFn<M>) => Promise<StateFn<N>>,
  o: (n: StateFn<N>) => Promise<StateFn<O>>,
  p: (o: StateFn<O>) => Promise<StateFn<P>>
): Promise<StateFn<P>>;
export async function pipeline(...args: any): Promise<any> {
  const [first, ...rest] = args;

  if (rest.length === 0) {
    return first;
  } else {
    let value = await first;
    for (let i = 0; i < rest.length; i++) {
      value = await rest[i](value);
    }
    return value;
  }
}
