import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const isServer = typeof window === "undefined";

const isSupported = !isServer && "ResizeObserver" in window;

const noop = () => {};

const noopObserver = { observe: noop, unobserve: noop };

const resizeObserver = !isSupported
  ? noopObserver
  : new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { target } = entry;
        const boundingClient = target.getBoundingClientRect();
        const set = (target as $Element).$$useElementDimensionsSet;
        if (set) {
          set(Object.assign(boundingClient, entry));
        }
      }
    });

export type ElementDimensions = ResizeObserverEntry & DOMRect;

type $Element = Element & {
  $$useElementDimensionsSet?: React.Dispatch<React.SetStateAction<ElementDimensions>>;
};

const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;

// NOTE(danielkov): this is used to stub DOMRectReadonly on the server
class Rect {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;

  constructor() {
    this.bottom = 0;
    this.height = 0;
    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.width = 0;
    this.x = 0;
    this.y = 0;
  }
  toJSON() {
    return JSON.stringify(this);
  }
}

const contentRect = new Rect();
const domRect = new Rect();
const size = { inlineSize: 0, blockSize: 0 };
const defaultValue: ElementDimensions = Object.assign(domRect, {
  contentBoxSize: size,
  borderBoxSize: size,
  contentRect,
  target: null as unknown as Element,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

const useDimensions = (): [ElementDimensions, (element?: Element | null) => void] => {
  const ref = useRef<$Element>(null);

  const [dimensions, set] = useState<ElementDimensions>(defaultValue);

  const setRef = useCallback((element?: Element | null) => {
    if (ref.current) {
      resizeObserver.unobserve(ref.current);
    }
    if (element instanceof Element) {
      (element as $Element).$$useElementDimensionsSet = set;
      resizeObserver.observe(element);
    }
  }, []);

  useIsomorphicLayoutEffect(
    () => () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    },
    [],
  );

  return [dimensions, setRef];
};

export default useDimensions;
