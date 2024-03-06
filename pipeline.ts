type MaybePromise<T> = Promise<T> | T;

export function pipeline<A>(a: Promise<A>): Promise<A>;
export function pipeline<A, B>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>
): Promise<B>;
export function pipeline<A, B, C>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>
): Promise<A>;
export function pipeline<A, B, C, D>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>
): Promise<D>;
export function pipeline<A, B, C, D, E>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>
): Promise<E>;
export function pipeline<A, B, C, D, E, F>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>
): Promise<F>;
export function pipeline<A, B, C, D, E, F, G>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>
): Promise<G>;
export function pipeline<A, B, C, D, E, F, G, H>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>
): Promise<H>;
export function pipeline<A, B, C, D, E, F, G, H, I>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>
): Promise<I>;
export function pipeline<A, B, C, D, E, F, G, H, I, J>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>
): Promise<J>;
export function pipeline<A, B, C, D, E, F, G, H, I, J, K>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>,
  jk: (j: J) => Promise<K>
): Promise<K>;
export function pipeline<A, B, C, D, E, F, G, H, I, J, K, L>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>,
  jk: (j: J) => Promise<K>,
  kl: (k: K) => Promise<L>
): Promise<L>;
export function pipeline<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>,
  jk: (j: J) => Promise<K>,
  kl: (k: K) => Promise<L>,
  lm: (l: L) => Promise<M>
): Promise<M>;
export function pipeline<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>,
  jk: (j: J) => Promise<K>,
  kl: (k: K) => Promise<L>,
  lm: (l: L) => Promise<M>,
  mn: (m: M) => Promise<N>
): Promise<N>;
export function pipeline<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>,
  jk: (j: J) => Promise<K>,
  kl: (k: K) => Promise<L>,
  lm: (l: L) => Promise<M>,
  mn: (m: M) => Promise<N>,
  no: (n: N) => Promise<O>
): Promise<O>;
export function pipeline<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>,
  jk: (j: J) => Promise<K>,
  kl: (k: K) => Promise<L>,
  lm: (l: L) => Promise<M>,
  mn: (m: M) => Promise<N>,
  no: (n: N) => Promise<O>,
  op: (o: O) => Promise<P>
): Promise<P>;
export function pipeline<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
  a: Promise<A>,
  ab: (a: A) => Promise<B>,
  bc: (b: B) => Promise<C>,
  cd: (c: C) => Promise<D>,
  de: (d: D) => Promise<E>,
  ef: (e: E) => Promise<F>,
  fg: (f: F) => Promise<G>,
  gh: (g: G) => Promise<H>,
  hi: (h: H) => Promise<I>,
  ij: (i: I) => Promise<J>,
  jk: (j: J) => Promise<K>,
  kl: (k: K) => Promise<L>,
  lm: (l: L) => Promise<M>,
  mn: (m: M) => Promise<N>,
  no: (n: N) => Promise<O>,
  op: (o: O) => Promise<P>,
  pq: (p: P) => Promise<Q>
): Promise<Q>;

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
