import {BASE_URL} from '../config'

export function onClick(e) {
  e.preventDefault();
  window.grecaptcha.ready(function() {
    window.grecaptcha.execute('6LdGv_EZAAAAAHPwtoTIPLs9FbLDOYUwHJCc4xVm', {action: 'submit'}).then(function(token) {
        console.log("sending captcha token:",token);
        fetch(BASE_URL + '/payment-sessions', {
          method: 'POST',
          headers: {
            'Authorization': token
          }
        })
        .then(resp => resp.json())
        .then(data => {
          console.log(data); 
          let sessionId = data['session-id'];
          // Create an instance of the Stripe object with your publishable API key
          var stripe = window.Stripe('pk_test_ztFkedIL0S6sNPNb2SuPWcuq');
          return stripe.redirectToCheckout({ sessionId });
        }).then(function(result) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, you should display the localized error message to your
          // customer using `error.message`.
          if (result.error) {
            alert(result.error.message);
          }
        })
        .catch(function(error) {
          console.error('Error:', error);
        });
    });
  });
}
