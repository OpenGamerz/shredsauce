var this_js_script = document.currentScript;
var testMode = this_js_script.getAttribute('testMode'); 
if (testMode == null) {
  testMode = 'off';
}

var unityPlayerDiv = document.getElementById('unityContent');
var videoContent = document.getElementById('contentElement');

var playButton = document.getElementById('playButton');
playButton.addEventListener('click', requestAds);

if(typeof(google) == "undefined"){
  // adblocker detected, show fallback

  ShowAdblockThing();
}

function ShowAdblockThing() {
  document.getElementById('adblockDiv').style.display = "block";
} 

function HideAdBlockThing() {
  onContentResumeRequested();
  hidePlayButton();

  var ele = document.getElementById("adblockDiv");
    ele.style.display = "none";
} 

function GetVideoContentParentWidth() {
  return videoContent.parentNode.clientWidth;
}

function GetVideoContentParentHeight() {
  return videoContent.parentNode.clientHeight;
}

// An event listener to tell the SDK that our content video
// is completed so the SDK can play any post-roll ads.
var contentEndedListener = function() {adsLoader.contentComplete();};
videoContent.onended = contentEndedListener;

// Request video ads.
var adsRequest = new google.ima.AdsRequest();
// Append &adtest=on for testing
// adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?ad_type=video&client=ca-games-pub-3862369362315452&description_url=https%3A%2F%2Fwww.shredsauce.com&videoad_start_delay=0&max_ad_duration=15000&sdmax=60000&adsafe=medium';


// iF3
// adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/7758099/640x480v_preroll_video&description_url=http%3A%2F%2Fshredsauce.com%2F&env=vp&impl=s&correlator=&tfcd=0&npa=0&gdfp_req=1&output=vast&sz=640x480&unviewed_position_start=1';

// Test March 1, 2019
adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?ad_type=video&client=ca-games-pub-3862369362315452&description_url=https%3A%2F%2Fshredsauce.com%2F&channel=4986550388&videoad_start_delay=0&hl=en&max_ad_duration=30000&adtest=off';

// Test feb 27, 2019
// adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?ad_type=video_image_text&client=ca-games-pub-3862369362315452&videoad_start_delay=0&description_url=http%3A%2F%2Fwww.google.com&max_ad_duration=20000&adtest=off';

// adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?iu=/7758099/640x480v_preroll_video&description_url=http%3A%2F%2Fshredsauce.com%2F&env=vp&impl=s&correlator=&tfcd=0&npa=0&gdfp_req=1&output=vast&sz=640x480&unviewed_position_start=1&adtest=on';

// Specify the linear and nonlinear slot sizes. This helps the SDK to
// select the correct creative if multiple are returned.
adsRequest.linearAdSlotWidth = GetVideoContentParentWidth();
adsRequest.linearAdSlotHeight = GetVideoContentParentHeight();
adsRequest.nonLinearAdSlotWidth = GetVideoContentParentWidth();
adsRequest.nonLinearAdSlotHeight = GetVideoContentParentHeight();

var adDisplayContainer =
new google.ima.AdDisplayContainer(
    document.getElementById('adContainer'),
    videoContent);

// Must be done as the result of a user action on mobile
adDisplayContainer.initialize();

// Re-use this AdsLoader instance for the entire lifecycle of your page.
var adsLoader = new google.ima.AdsLoader(adDisplayContainer);

// Add event listeners
adsLoader.addEventListener(
  google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
  onAdsManagerLoaded,
  false);
adsLoader.addEventListener(
  google.ima.AdErrorEvent.Type.AD_ERROR,
  onAdError,
  false);

function onAdError(adErrorEvent) {
  // Handle the error logging and destroy the AdsManager
  console.log(adErrorEvent.getError());
  onContentResumeRequested();

  if (typeof adsManager !== 'undefined') {
    adsManager.destroy();
  }
}

function hidePlayButton() {
  playButton.style.display = 'none';
  playButton.style.height = '0px';
}

function requestAds() {
  hidePlayButton();

  var cookie = getCookie("timeSinceLastAd");
  if (cookie == "") {
    // Ads haven't played recently. Play ad
    if (adsRequest != null)
      adsLoader.requestAds(adsRequest);
    else {
      alert("Error: ads manager not found");
      onContentResumeRequested();
    }
  } else {
    // Ads have played recently, go straight to content
    onContentResumeRequested();
  }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // alert("onAdsManagerLoaded()");
  // Get the ads manager.
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoContent);  // See API reference for contentPlayback

  // Add listeners to the required events.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);

  try {
    // Initialize the ads manager. Ad rules playlist will start at this time.
    adsManager.init(GetVideoContentParentWidth(), GetVideoContentParentHeight(), google.ima.ViewMode.NORMAL);
    // Call start to show ads. Single video and overlay ads will
    // start at this time; this call will be ignored for ad rules, as ad rules
    // ads start when the adsManager is initialized.
    adsManager.start();
  } catch (adError) {
    // An error may be thrown if there was a problem with the VAST response.
    onContentResumeRequested();
  }
}

function onContentPauseRequested() {
  // alert("onContentPauseRequested()");
  // This function is where you should setup UI for showing ads (e.g.
  // display ad timer countdown, disable seeking, etc.)
  // videoContent.removeEventListener('ended', contentEndedListener);
  // videoContent.pause();

  // Will expire after 300 seconds
  setCookie ("timeSinceLastAd", Date.now(), 300);

   videoContent.style.width = GetVideoContentParentWidth()+"px";
   unityPlayerDiv.style.width = "0px";
 
   videoContent.style.display = "inline";
   unityPlayerDiv.style.display = "none";
}

function onContentResumeRequested() {
  // This function is where you should ensure that your UI is ready
  // to play content.

  // Ad container hides the player, get rid of it
  document.getElementById('adContainer').style.width = "0px";
  document.getElementById("adContainer").innerHTML = "";

  videoContent.style.width = "0px";
  unityPlayerDiv.style.width = GetVideoContentParentWidth()+"px";

  videoContent.style.display = "none";
  unityPlayerDiv.style.display = "inline";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, ts, expireTime) {
    var d = new Date();
    d.setTime(ts + (expireTime * 1000));
    var expiry = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + ts + ";" + expiry + ";path=/";
}