"use client";

import { useEffect } from "react";

export function LocaleHtml() {
  useEffect(() => {
    document.documentElement.lang = "en";
    return () => { document.documentElement.lang = "ko"; };
  }, []);
  return null;
}
