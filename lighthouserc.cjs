module.exports = {
  ci: {
    collect: {
      url: ["https://gigworlds.net"],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox --headless=new",
        preset: "desktop"
      }
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.5 }],
        "categories:accessibility": ["warn", { minScore: 0.8 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        "uses-http2": "off",
        "uses-long-cache-ttl": "warn"
      }
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci-reports"
    }
  }
};
