# Security Baseline

This baseline applies to production websites, APIs, and public-facing tools.

## Required Headers

Start with this conservative header set and adjust per application needs:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; form-action 'self'; upgrade-insecure-requests
```

Only enable HSTS preload after confirming all subdomains support HTTPS.

## Nginx Example

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; form-action 'self'; upgrade-insecure-requests" always;
```

## Next.js Example

```js
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()"
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; form-action 'self'; upgrade-insecure-requests"
  }
];

export default {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};
```

## Form Handling

- Validate on the server.
- Normalize and limit input length.
- Escape output by context.
- Use CSRF protection when cookies authenticate requests.
- Rate-limit public forms.
- Store only data that is needed.
- Do not log secrets, payment data, or unnecessary personal data.

## Secret Handling

- Never commit `.env` files.
- Use environment-specific secret stores.
- Rotate exposed credentials immediately.
- Keep client-exposed keys scoped and restricted by domain, API, and quota where possible.
