# Analytics and Measurement

Measurement should help improve the product without collecting unnecessary personal data.

## Measurement Principles

- Track decisions, not vanity.
- Keep events stable and documented.
- Avoid personal data in event names, properties, URLs, and logs.
- Use consent-aware tracking when required.
- Connect analytics to conversion and reliability goals.

## Core Events

For a marketing or service website:

- `cta_clicked`
- `contact_form_started`
- `contact_form_submitted`
- `booking_started`
- `booking_completed`
- `case_study_viewed`
- `audit_request_started`
- `audit_request_submitted`

For a product:

- `signup_started`
- `signup_completed`
- `login_completed`
- `onboarding_step_completed`
- `subscription_started`
- `subscription_canceled`
- `critical_action_completed`

## Event Schema

```json
{
  "event": "cta_clicked",
  "properties": {
    "page": "/",
    "cta_id": "hero-primary",
    "cta_text": "Book a Launch Audit"
  }
}
```

Do not include passwords, tokens, full names, emails, phone numbers, payment details, or private messages in analytics properties.

## Dashboard Minimums

- Traffic by source.
- Top landing pages.
- Conversion rate by primary CTA.
- Form completion rate.
- Core Web Vitals.
- 404 count.
- Server or application error rate.
- Search impressions and clicks when Search Console is available.
