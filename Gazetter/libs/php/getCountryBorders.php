<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $data = file_get_contents("countryBorders.geo.json");
    $decode = json_decode($data,true);

    foreach ($decode['features'] as $feature) {
        if($feature['properties']["iso_a2"] === $_REQUEST['countryCode2']){
            $border = $feature;
            break;
        }
        
    }

    $output["data"] = $border;
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 
?>