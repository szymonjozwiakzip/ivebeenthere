import { useState, useEffect } from "react";
import { IOC_TO_NAME } from "@/data/iocCountries";

export function useCountryNames(): Map<string, string> {
  const [names] = useState<Map<string, string>>(
    () => new Map(Object.entries(IOC_TO_NAME))
  );

  useEffect(() => {
    /* IOC names are static - no map fetch needed */
  }, []);

  return names;
}
