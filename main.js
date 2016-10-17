/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}




function checkForScamSite(url) {
  var siteList = new Promise(function (resolve, reject) {
    var theList = fetch('data/data.json').then(
      function (response) {
        if (response.ok) {
          return response.json()
        } else {
          var err = "list could not be fetched!"
          reject(err)
        }
      }
    ).then(function (res) {
      resolve(res)
    })
  })


  siteList.then(

    function(list) {
      var _url = url;

      list.forEach((item) => {

        if (url.includes(item)) {
          notify(_url)
          return;
        }
      })
    }
  )

  function notify(url) {
    var notification = chrome.notifications.create(
      'id1', {
        type: 'basic',
        iconUrl: 'images/ScamAlert.jpg',  // icon url - can be relative
        title: 'Scampage Warner Warning!',
        message: `The site: ${url} was found in my records! They will scam your CC Information without knowing it!`,  // notification body text
        buttons: [{
          title: 'OK'
        }]
      });

    

    chrome.notifications.onButtonClicked.addListener(function(
      notId, buttonIndex) {
      chrome.notifications.clear('id1');
    })

  }
}

chrome.webNavigation.onCompleted.addListener(function(o) {
  console.log("Here", o)
  getCurrentTabUrl(checkForScamSite)
});
