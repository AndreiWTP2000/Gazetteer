<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $countryName = $_REQUEST['countryName'];
    $countryName = urlencode($countryName);

	$cityName = $_REQUEST['cityName'];
    $cityName = urlencode($cityName);
 
   $url = 'https://nominatim.openstreetmap.org/search.php?q=' . $cityName . '%2C+' . $countryName . '&' . $_REQUEST['countryCode2'] . '&format=jsonv2' ;

    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_USERAGENT, 'GHA HA HA HA');

	$result=curl_exec($ch);

    curl_close($ch);
	

	$decode = json_decode($result,true);
	$lat = $decode[0]['lat'];
	$lon = $decode[0]['lon'];	
	
	$output["lat"] = $lat;
	$output["lon"] = $lon;
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>