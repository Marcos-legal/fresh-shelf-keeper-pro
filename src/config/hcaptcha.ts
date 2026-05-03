// hCaptcha configuration
// IMPORTANT: The previous test key (10000000-ffff-ffff-ffff-000000000001) was a public
// dummy key that auto-passes every challenge, providing no bot protection.
//
// To enable real bot protection:
// 1. Register at https://www.hcaptcha.com and obtain a production site key + secret.
// 2. Set HCAPTCHA_SITE_KEY below to your real site key.
// 3. In Supabase dashboard → Authentication → Settings, configure the matching secret.
// 4. Set HCAPTCHA_ENABLED to true.
//
// Until a real key is configured, captcha is disabled to avoid a false sense of security.

export const HCAPTCHA_ENABLED = false;
export const HCAPTCHA_SITE_KEY = '';
