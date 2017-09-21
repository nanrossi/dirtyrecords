;(function () {
  const applicationServerPublicKey = 'BJWEAgYnQ36hYqGVYQjrHWzoEkbPxr_-GrKzEVuNDTsLoU1aQ5pCIm_f-08KDMWmUQmxZobNpcmKvq2T87LP-tw';
  const pushButton = document.querySelector('#button');

  let isSubscribed = false;
  let swRegistration = null;

  if ('serviceWorker' in navigator) {
    return installServiceWorker()
  }

  function offlineNotAvaiable() {
    document.getElementsByTagName('h1')[0].textContent = 'Service Worker Not Available'
  }

  function installServiceWorker() {
    navigator.serviceWorker.register('../service-worker.js')
    .then(function(swReg) {
        console.log('Service Worker is registered', swReg);

        swRegistration = swReg;
        initialiseUI();
      })
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
    navigator.serviceWorker.oncontrollerchange = onControllerChange
  }

  function initialiseUI() {
    pushButton.addEventListener('click', function() {
      pushButton.disabled = true;
      if (isSubscribed) {
        // TODO: Unsubscribe user
      } else {
        subscribeUser();
      }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      isSubscribed = !(subscription === null);

      updateSubscriptionOnServer(subscription);

      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }

      updateBtn();
    });
  }

  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log('User is subscribed:', subscription);

      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();
    })
    .catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
      updateBtn();
    });
  }

  function updateBtn() {
    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
  }

  function onControllerChange() {
    var html = '<div style="'
    html += 'position: fixed; bottom: 1em; left: 1em;'

    if (localStorage.getItem('service-worker')) {
      html += 'background: yellow; padding: 1em;'
      html += '">'
      html += 'Refresh the page to see the newest content'
    } else {
      html += 'background: green; padding: 1em;'
      html += '">'
      html += 'Offline Ready'

      localStorage.setItem('service-worker', 'done')
    }

    html += '</div>'

    document.body.insertAdjacentHTML('beforeend', html)
  }

  function updateSubscriptionOnServer(subscription) {
    const subscriptionJson = document.querySelector('.json');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
    }
  }

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}())
