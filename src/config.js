var base_url = 'https://0qog733y06.execute-api.us-east-1.amazonaws.com/production';
if (process.env.NODE_ENV === 'development') {
    base_url = 'https://0qog733y06.execute-api.us-east-1.amazonaws.com/staging'
}
export const BASE_URL = base_url;

export const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

export const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;