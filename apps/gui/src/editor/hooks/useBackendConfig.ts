import { useState } from "react";
import { Backend } from "@lmscript/editor-tools/backend-config";

const useLocalStorageState = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  const setLocalStorageState = (value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setLocalStorageState];
};

export const useBackendConfig = () => {
  const [backend, setBackend] = useLocalStorageState<Backend | null>("backend-config-v1", null);
  return {
    backend,
    setBackend,
  };
};
