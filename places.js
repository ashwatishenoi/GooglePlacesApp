var latitude, longitude;
var map;
var searchBox;
var count = 0;
var markers = [];

/*get the co ordinates of current location*/
function getCurrLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      /* reset map t ocurrent location*/
      map.setCenter(pos);
    });
  } else {
    // Browser doesn't support Geolocation
    showError();
  }
};

function showError(error) {
  alert(error.message);
};

/*get places details based on query in searchBox*/
function search() {

  var places = searchBox.getPlaces();

  if (places.length == 0) {
    return;
  }

  // Clear out the old markers.
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];

  // For each place, get the icon, name and location.
  var bounds = new google.maps.LatLngBounds();
  places.forEach(function(place) {
    var icon = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };

    // Create a marker for each place.
    markers.push(new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location
    }));

    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  });
  map.fitBounds(bounds);
  /* Dispaly the places details in the right panel*/
  showResults(places);
};

/*Displays the details of each result fetched*/
function showResults(places) {

  /*count keeps track of number of li elements and used to assign id name to the li element*/
  count = 0;

  /*clear the content in the right panel before populating with new results*/
  $('#places').empty();

  /*Populate the panel*/
  var placesList = document.getElementById('places');

  places.forEach(function(place) {
    /*get more details*/
    var request = {
      placeId: place.place_id
    };

    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, function(details, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        var li_str = buildEachLi(place, details);
        placesList.innerHTML += li_str;
       

        addHoverFn();
		if(place.rating!==undefined)
		{
		var star_id='star-'+count;
		console.log(place.rating);
		var rate=parseFloat(place.rating);
		console.log(rate);
		$(function () {
 
		  $('#'+star_id).rateYo({
			  rating: rate,
		    readOnly: true,
			  precision:2,
			  starWidth: "20px"
		  });
		});
	}
		 
		 count++;
      }

    });

  });


};

function buildEachLi(place, details) {

  /* var str='<li id="'+count+'">' +'<div class="row"> <div class="col-md-8">'+place.name  +'</br>'+'<table class="table table-condensed"><tr><td> <i class="fa fa-map-marker"></i></td>'+'<td>'+place.formatted_address+'</td></tr>';*/
  var str = ['<li id="', count, '">',
    '<div class="row">',
    ' <div class="col-md-8">', place.name, '</br>',
    '<table class="table table-condensed">',
    '<tr>',
    '<td> <i class="fa fa-map-marker"></i></td>',
    '<td>', place.formatted_address, '</td></tr>'
  ].join('');

  /*if(details.formatted_phone_number!==undefined){
        str+='<tr><td><i class="fa fa-phone"></i></td>'+'<td>'+details.formatted_phone_number+'</td></tr>';
      }   */

  if (details.formatted_phone_number !== undefined) {
    var phone = ['<tr>',
      '<td><i class="fa fa-phone"></i></td>',
      '<td>', details.formatted_phone_number, '</td>',
      '</tr>'
    ].join('');
    str += phone;
  }
  if (details.website !== undefined) {

    var el = document.createElement('a');
    el.href = details.website;
    var site = el.hostname.replace("www.", '');
   	var website=['<tr>',
					'<td><i class="fa fa-globe"></i></td>',
					'<td><a target=blank href="' + details.website + '">' + site + '</a></td>',
				'</tr></table>'].join('');
				str+=website;
  }

  if (place.rating !== undefined)
  {
	  var star=['<div id="star-',count,'"></div>'].join('');
	  str+=star;
	  
  }

  if (place.price_level !== undefined) {
    var price = "";
    for (var i = 1; i <= place.price_level; i++) {
      price += '<i class="fa fa-usd text-success"></i>';
    }
    str += price + '</br>';
  }

  if (place.opening_hours !== undefined) {
    var open = place.opening_hours;
    var isOpen = open.open_now;
    if (isOpen)
      str += '<span class="text-success">Open Now</span>' + '</br>';
    else
      str += '<span class="text-danger">Closed Now</span>' + '</br>';
  }

  str += '</div>';

  if (place.photos !== undefined) {
    var image = place.photos[0];
    var imgUrl = image.getUrl({
      'maxWidth': 150,
      'maxHeight': 150
    });
    str += '<div class="col-md-3 image"><img src=' + imgUrl + '></div>';
  }

  str += '</div>' + '</li>';

  return str;
};

function addHoverFn() {
  $("li").hover(function() {
    var li_class = this.id;
    var marker = markers[li_class];
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }, function() {
    var li_class = this.id;
    var marker = markers[li_class];
    marker.setAnimation(null);
  });

};

/*google place searchbox*/

function initAutocomplete() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 37.775,
      lng: -122.419
    },
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  /*set map to current location*/
  getCurrLocation();
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  searchBox = new google.maps.places.SearchBox(input);

  var btn = document.getElementById('srch-btn');

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(btn);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

}