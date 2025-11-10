import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  const filteredCodes = new Set(["DEP0040"]);
  const filteredTerms = ["punycode"];

  process.on("warning", (warning) => {
    const message = warning?.message ?? "";
    const warningCode = (warning as NodeJS.ErrnoException)?.code ?? "";
    const shouldFilter =
      filteredCodes.has(warningCode) ||
      filteredTerms.some((term) => message.includes(term));

    if (!shouldFilter) {
      console.warn(warning);
    }
  });
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["punycode"],
};

export default nextConfig;
