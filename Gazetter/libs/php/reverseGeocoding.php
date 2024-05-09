<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

   $url = 'https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['lat'] . ',' . $_REQUEST['lng'] . '&key=5ad32249c7984870bfa1a75ad7064e42&pretty=1' ;

    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

    curl_close($ch);
	

	$decode = json_decode($result,true);	
	
	$output["data"] = $decode;
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>