import Bowser from 'bowser'

import {
  BASE_URL,
  STRIPE_PUBLISHABLE_KEY,
  RECAPTCHA_SITE_KEY
} from '../config'

export function onClick(e) {
  e.preventDefault();

  let systemInfo = Bowser.parse(navigator.userAgent)
  let browser = systemInfo.browser.name.toLowerCase()
  let os = systemInfo.os.name.toLowerCase()
  if (os.includes('ios') || browser.includes('safari')) {
    alert(
      'Registration is not supported on Safari or iOS devices. ' +
      'Please use a different browser and/or device to register and ' +
      'then enter the license key you receive here.'
    )
    return
  }

  window.grecaptcha.ready(function() {
    window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'submit'}).then(function(token) {
        fetch(BASE_URL + '/payment-sessions', {
          method: 'POST',
          headers: {
            'Authorization': token
          }
        }).then(
          resp => resp.json()
        ).then(data => {
          let sessionId = data['session-id'];
          // Create an instance of the Stripe object with your publishable API key
          var stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
          return stripe.redirectToCheckout({ sessionId });
        }).then(function(result) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, you should display the localized error message to your
          // customer using `error.message`.
          if (result.error) {
            alert(result.error.message);
          }
        }).catch(function(error) {
          console.error('Error:', error);
        });
    });
  });
}
