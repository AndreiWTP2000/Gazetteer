<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    // $apiKey = 'lid+HZLIndla4Kw3mQyZzQ==dWNZczX6Ylvw98ne';
    // $url = 'https://api.api-ninjas.com/v1/holidays?country='. $_REQUEST['country'] . '&year=2023&type=national_holiday';
	// $url = 'https://date.nager.at/api/v3/publicholidays/2023/'. $_REQUEST['country'];
	$url = 'https://holidayapi.com/v1/holidays?pretty&key=815419e6-05b0-428d-a85f-53be6f11cd09&country=' . $_REQUEST['country'] . '&year=2022';
	


    
    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
    // curl_setopt($ch, CURLOPT_HTTPHEADER, [
    //     'X-Api-Key:' . $apiKey
    // ]);

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