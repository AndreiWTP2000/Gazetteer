<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|info&inprop=url&explaintext&pageids='. $_REQUEST['pageId'];
    
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