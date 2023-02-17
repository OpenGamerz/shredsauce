var isOverGoogleAd = false;









// var ad = /adsbygoogle/;



$(document).ready(function()
{	

    // const element = document.querySelector(".myAds");

    // element.addEventListener("click", () => {
    //     console.log("test click");
    // });
    

    
	$('.myAds').on('mouseover', function () {
		// if(ad.test($(this).attr('class'))){
			isOverGoogleAd = true;
            console.log("test hover");
		// }
	});
	$('.myAds').on('mouseout', function () {
		// if(ad.test($(this).attr('class'))){
			isOverGoogleAd = false;
            console.log("test hover out");
		// }
	});
});

$(window).blur(function(e){
	if(isOverGoogleAd){
		$('.myAds').hide();
		$.ajax({
			type: "post",
			url: "/ThirdParty/AdsenseBlocker/recorder.php",
			data: {
				adUrl: window.location.href
				}
		});
	}
});