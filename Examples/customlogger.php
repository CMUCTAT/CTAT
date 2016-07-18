<?php

$index   =0;
$content ="";
$pure    =array ();
$ipaddr  =$_SERVER['REMOTE_ADDR'];
$messages=array ();
$data ="";

$logFile = fopen("tutorlog.txt", "a") or die("Unable to open log file!");
$logDebug = null;

// Uncomment the line below to see what the script is doing
// $logDebug=fopen("tutordebug.txt", "a") or die("Unable to open log file!");

/**------------------------------------------------------------------------------------
*/
function debug ($aMessage)
{
	global $logDebug;

	if ($logDebug)
	{
		fwrite($logDebug,$aMessage);
		fwrite($logDebug,"\n");
	}	
}
/**------------------------------------------------------------------------------------
*/
function clean_xml ($raw)
{ 
	$fixed="";

	$test=strstr ($raw,'<log_action');

	if ($test!=FALSE)
	{
		$fixed="<?xml_version \"1.0\" encoding=\"UTF-8\"?> ".$test;
	}
	else
	{
		$fixed=$raw;
	}

	$location=strrpos ($fixed,"<?xml"); 
	$cut=substr ($fixed,0,$location);
	$cut.="</log_action>";

	return ($cut);
}
/**------------------------------------------------------------------------------------
*/
function clean_stream ($incoming)
{
	debug ("clean_stream ()");

	global $pure;

	$temper=array ();

	// take out the payload ...

	foreach ($incoming as $examiner)
	{  
		$newlined=str_replace ("\n","",$examiner);

		$test=strstr ($newlined,"</log_action>");

		if ($test!=false)
		{
			$tutorinfo=strstr ($newlined,"<tutor_related_message_sequence");

			$payloadindex=strpos ($newlined,"<tutor_related_message_sequence");
			$tutorpayload=substr ($newlined,0,$payloadindex);
			$tutorpayload.="</log_action>";

			array_push ($temper,clean_xml ($tutorpayload));

			$tutormessage=str_replace ("</log_action>","",$tutorinfo);

			array_push ($temper,'<?xml_version "1.0" encoding="UTF-8"?>'.$tutormessage);  
		}
		else
		{
			array_push ($temper,$newlined); 
			array_push ($temper,"<content></content>");
		}  
	} 

	return ($temper);
}
/**------------------------------------------------------------------------------------
*/
function clean_data ($examiner)
{
	debug ("clean_data ()");

	global $pure;

	$temper=array ();

	// seperate the envelope from the payload ...

	$newlined=str_replace ("\n","",$examiner);

	$test=strstr ($newlined,"</log_action>");

	if ($test!=false)
	{
		debug ("We have a log action, processing ...");
		
		array_push ($temper,$newlined); 
		
		$noOutterXML=strpos($newlined,"?>");
		$leftHalf=substr ($newlined,$noOutterXML+2);
		
		debug ("Left half: ".$leftHalf);
		
		$innerXMLLoc=strpos($leftHalf,">");
		$innerXML=substr ($leftHalf,$innerXMLLoc+1);
		
		debug ("Inner XML: ".$innerXML);
		
		$tutorpayload=str_replace ("</log_action>","",$innerXML);
		
		debug ("Tutor payload: ".$tutorpayload);
				
		array_push ($temper,$tutorpayload);
	}
	else
	{
		debug ("We don't have a log action, simple subbing ...");

		array_push ($temper,$newlined); 
		array_push ($temper,"<content></content>");
	}  

	return ($temper);
}
/**------------------------------------------------------------------------------------
* Fix the session id such that it represents a string useable as a file name, in case
* you want to open a different log file per session.
*/
function fix_session ($incoming)
{
	$result=str_replace ('-','_',$incoming);
  
	return ($result);
} 
//-------------------------------------------------------------------------------------

debug ("Run start");

// pre clean ...

$data=$_POST;

if (empty ($_POST)==true)
{
	debug ('Processing POST data ..');
	
	$data=$HTTP_RAW_POST_DATA;
}	

debug ("Processing RAW Post data ...");

if (empty ($data)==true)
{
	debug ('ERROR: Unable to extract data from POST message!');
	return;
}

// take out the payload and fix any malformed xml ...

array_push ($pure,clean_data ($data));

// Process the pure xml payload ...

foreach ($pure as $value)
{
	$decoded=urldecode ($value [1]);
	
	debug ("Decoded: ".$decoded);
		
	$xml=new SimpleXMLElement ($value [0]);

	$session_id=fix_session ($xml ['session_id']);
		
	fwrite($logFile,"[[ENVELOPE]][s:".$session_id."] -- ".$value [0]."\n");
	fwrite($logFile,"[[CONTENT ]][s:".$session_id."] -- ".$decoded."\n");
}	

echo 'MESSAGE RECEIVED';

debug ("Run end");

?>
