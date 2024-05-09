<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

   $url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword='. $_REQUEST['attraction'] .'&location=' . $_REQUEST['lat'] . '%2C' . $_REQUEST['lng'] .'&radius=20000&key=AIzaSyChLZvdx8mdaGsF1KaEiTcGNRgCQ3sQjb4'  ;
   

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