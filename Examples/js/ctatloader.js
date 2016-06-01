/**-----------------------------------------------------------------------------
 $Author: vvelsen $
 $Date: 2016-05-12 11:51:14 -0400 (Thu, 12 May 2016) $
 $HeadURL: svn://pact-cvs.pact.cs.cmu.edu/usr5/local/svnroot/AuthoringTools/trunk/HTML5/ctatloader.js $
 $Revision: 23517 $

 -
 License:
 -
 ChangeLog:
 -
 Notes:

 */

//Here there be drivers ...

/**
 * Replaced by src/CTATLMS
 */

// This is where the actual loader code is defined ...

console.log ("Starting ctatloader ...");

if(typeof(CTATTarget) == "undefined" || !CTATTarget)
{
	var CTATTarget="Default";
}

var authoringQuery = {};

/**
 * Started with an example at: // http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
 */
function loadjscssfile(filename, filetype)
{
	console.log ("loadjscssfile ("+filename+","+filetype+")");

	var fileref = null;
	if (filetype=="js")
	{
		//if filename is a external JavaScript file
		fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", filename);
	}
	else if (filetype=="css")
	{
		//if filename is an external CSS file
		fileref=document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename);
	}

	if (fileref!==null)
	{
		console.log ("Loading: " + filename);
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}
}

/**
 *
 */
function dumpOLIEnvironment ()
{
	var win = window.frameElement;

	console.log ("OLI activity_mode (data-activitymode): " + win.getAttribute("data-activitymode"));
	console.log ("OLI activity_context_guid: (data-activitycontextguid)" + win.getAttribute("data-activitycontextguid"));
	console.log ("OLI oli_auth_token: (data-authenticationtoken)" + win.getAttribute("data-authenticationtoken"));
	console.log ("OLI resource_type_id: (data-resourcetypeid)" + win.getAttribute("data-resourcetypeid"));
	console.log ("OLI session_id: (data-sessionid)" + win.getAttribute("data-sessionid"));
	console.log ("OLI superactivity_url: (data-superactivityserver)" + win.getAttribute("data-superactivityserver"));
	console.log ("OLI activity_guid: (data-activityguid)" + win.getAttribute("data-activityguid"));
	console.log ("OLI user_guid: (data-userguid)" + win.getAttribute("data-userguid"));
}

/**
 *
 */
function loadCTAT ()
{
	console.log ("loadCTAT () Loading for target: " + CTATTarget);

	if (CTATTarget=="AUTHORING")
	{
		CTATConfiguration.set('tutoring_service_communication', 'websocket');
		CTATConfiguration.set('user_guid', 'author');
		CTATConfiguration.set('question_file', '');
		CTATConfiguration.set('session_id', authoringQuery ['session']);
		CTATConfiguration.set('remoteSocketPort', authoringQuery ['port']);
		CTATConfiguration.set('remoteSocketURL', "127.0.0.1");

		return;
	}

	var win = window.frameElement;

	/*
	 * Check to see if we're running on the OLI platforms ...
	 * We're using this spec as a reference: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes
	 */
	if (CTATTarget=="OLI")
	{
		CTATConfiguration.set('SessionLog', 'false');
		CTATConfiguration.set('DeliverUsingOLI', 'true');
		CTATConfiguration.set('tutoring_service_communication', 'javascript');

		//loadjscssfile ("css/themes/default/easyui.css","css");
		//loadjscssfile ("css/themes/icon.css","css");
		//loadjscssfile ("css/CTAT.css","css");
		//loadjscssfile ("css/stattutor.css","css");

		/**
		 * We can't load jquery this way because we use onload and onready from it. That
		 * means we might want to replace those calls with the calls JQuery does so that
		 * we don't have an immediate dependency on it.
		 */
		//loadjscssfile ("jquery/jquery-1.9.0.min.js","js");
		//loadjscssfile ("jquery/jquery.easyui.min.js","js");

		//loadjscssfile ("ctatjslib/ctat.min.js","js");

		return;
	}

	/*
	 *
	 */
	if (CTATTarget=="Google")
	{
		loadjscssfile ("https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js","js");

		loadjscssfile ("http://augustus.pslc.cs.cmu.edu/html5/ctatjslib/ctat-tutor-sidebar.min.js","js");

		loadjscssfile ("http://augustus.pslc.cs.cmu.edu/html5/src/google/rpcobject.js","js");
		loadjscssfile ("http://augustus.pslc.cs.cmu.edu/html5/src/google/queue.js","js");
		loadjscssfile ("http://augustus.pslc.cs.cmu.edu/html5/src/google/gasqueue.js","js");
		loadjscssfile ("http://augustus.pslc.cs.cmu.edu/html5/src/google/ctattablegoogle.js","js");
		loadjscssfile ("http://augustus.pslc.cs.cmu.edu/html5/css/google-sidebar.css","css");

		prepTutorArea();

		return;
	}
	
	/*
	 *
	 */
	if (CTATTarget=="ASSISTMENTS")
	{
		return;
	}	

	/*
	 *
	 */
	if (CTATTarget=="SCORM")
	{
		//lmsDriver=new CTATSCORMDriver ();

		/*
		CTATConfiguration.set('tutoring_service_communication','javascript');
		CTATConfiguration.set('user_guid','scormuser');
		CTATConfiguration.set('question_file','');
		CTATConfiguration.set('session_id',authoringQuery ['session']);
		CTATConfiguration.set('remoteSocketPort',authoringQuery ['port']);
		CTATConfiguration.set('remoteSocketURL',"127.0.0.1");
		 */

		return;
	}

	/*
	 *
	 */
	if (CTATTarget=="LTI")
	{

		return;
	}
	if (CTATTarget=="XBlock") return; // handled in XBlock code.


	/*
	 * The target CTAT is synonymous with TutorShop. You can use this target outside of
	 * TutorShop if you use the same directory structure for the css, js and brd files
	 */
	if(CTATConfiguration.get("LMS") == "TutorShop")
	{
		CTATTarget = "CTAT";
	}

	/**
	 * This target is available to you if you would like to either develop your own
	 * Learner Management System or would like to test and run your tutor standalone.
	 */
	if (CTATTarget=="Default")
	{
		useDebugging=true;

		// CTATConfiguration.set('tutoring_service_communication', 'javascript');

		//loadjscssfile ("http://ctat.pact.cs.cmu.edu/html5releases/latest/CTAT.css","css");
		//loadjscssfile ("http://ctat.pact.cs.cmu.edu/html5releases/latest/ctat.min.js","js");
	}
}

/**
 *
 */
function initOnload ()
{
	//useDebugging=true;

	console.log ("initOnload ()");

	if (CTATTarget=="AUTHORING")
	{
		initTutor ();

		// Once all the CTAT code has been loaded allow developers to activate custom code
		// All developers would have to do is provide the method called 'init'. This is a
		// better way of managing the order of execution since the ready function essentially
		// overwrites the body onLoad function

		if (window.hasOwnProperty('ctatOnload'))
		{
			window ['ctatOnload']();
		}
		else
		{
			console.log ("Warning: window.ctatOnload is not available");
		}

		return;
	}

	if (CTATTarget=="OLI")
	{
		//useDebugging=true;

		var win = window.frameElement;
		CTATConfiguration.set('activity_mode', win.getAttribute("data-activitymode"));
		CTATConfiguration.set('activity_context_guid', win.getAttribute("data-activitycontextguid"));
		CTATConfiguration.set('oli_auth_token', win.getAttribute("data-authenticationtoken"));
		CTATConfiguration.set('auth_token', win.getAttribute("data-authenticationtoken"));
		CTATConfiguration.set('resource_type_id', win.getAttribute("data-resourcetypeid"));
		CTATConfiguration.set('session_id', win.getAttribute("data-sessionid"));
		CTATConfiguration.set('superactivity_url', win.getAttribute("data-superactivityserver"));		
		CTATConfiguration.set('activity_guid', win.getAttribute("data-activityguid"));
		CTATConfiguration.set('deliverymode', win.getAttribute("data-activitymode"));
		CTATConfiguration.set('datamode', win.getAttribute("data-mode"));
		CTATConfiguration.set('user_guid', win.getAttribute("data-userguid"));

		if (!CTATConfiguration.get('activity_context_guid'))
		{
			CTATConfiguration.set('activity_context_guid', "undefined");		
		}		
		
		if (CTATConfiguration.get('activity_mode'))
		{
			if (CTATConfiguration.get('activity_mode')=='review')
			{
				CTATConfiguration.set('activity_context_guid', "undefined");
			}
		}

		var sess = CTATConfiguration.get("session_id");
		if(!sess || sess == "none")
		{
			CTATConfiguration.set("session_id", "qa-test_"+guid());
		}

		dumpOLIEnvironment ();

		oliDriver=new OLIDriver ();
		oliMessageHandler = new OLIMessageHandler();
		oliMessageHandler.assignHandler(oliDriver);
		oliCommLibrary=new CTATCommLibrary (oliMessageHandler,false,null);
		oliComm = new OLIComm(CTATConfiguration.get("superactivity_url"));
		oliComm.loadClientConfig();

		// At the end of this sequence we do not call initTutor since
		// we have to do a lot more back and forth GET calls to OLI before
		// we're ready for that. See OLIComm.js for more information
	}

	/*
	 *
	 */
	if (CTATTarget=="SCORM")
	{
		CTATLMS.init.SCORM();
		// Initialize our own code ...
		initTutor ();

		// Once all the CTAT code has been loaded allow developers to activate custom code
		// All developers would have to do is provde the method called 'init'. This is a
		// better way of managing the order of execution since the ready function essentially
		// overwrites the body onLoad function

		if (window.hasOwnProperty('ctatOnload'))
		{
			window ['ctatOnload']();
		}
		else
		{
			console.log ("Warning: window.ctatOnload is not available");
		}

		return;
	}
	
	/*
	 *
	 */
	if (CTATTarget=="ASSISTMENTS")
	{
		iframeLoaded(); // Assistments specific call
	
		// Initialize our own code ...
		initTutor ();

		// Once all the CTAT code has been loaded allow developers to activate custom code
		// All developers would have to do is provde the method called 'init'. This is a
		// better way of managing the order of execution since the ready function essentially
		// overwrites the body onLoad function

		if (window.hasOwnProperty('ctatOnload'))
		{
			window ['ctatOnload']();
		}
		else
		{
			console.log ("Warning: window.ctatOnload is not available");
		}
		
		return;
	}	

	/*
	 *
	 */
	if (CTATTarget=="LTI")
	{
		CTATLMS.init.TutorShop(); // FIXME: this assumes LTI is hosted on TutorShop
		initTutor ();

		// Once all the CTAT code has been loaded allow developers to activate custom code
		// All developers would have to do is provde the method called 'init'. This is a
		// better way of managing the order of execution since the ready function essentially
		// overwrites the body onLoad function

		if (window.hasOwnProperty('ctatOnload'))
		{
			window ['ctatOnload']();
		}
		else
		{
			console.log ("Warning: window.ctatOnload is not available");
		}

		return;
	}

	if (CTATTarget=="XBlock") return; // handled in the xblock code.
	/*
	 * The target CTAT is synonymous with TutorShop. You can use this target outside of
	 * TutorShop if you use the same directory structure for the css, js and brd files
	 */
	if (CTATTarget=="CTAT")
	{
		CTATLMS.init.TutorShop();
		initTutor ();

		// Once all the CTAT code has been loaded allow developers to activate custom code
		// All developers would have to do is provde the method called 'init'. This is a
		// better way of managing the order of execution since the ready function essentially
		// overwrites the body onLoad function

		if (window.hasOwnProperty('ctatOnload'))
		{
			window ['ctatOnload']();
		}
		else
		{
			console.log ("Warning: window.ctatOnload is not available");
		}

		return;
	}

	/*
	 * This target is available to you if you would like to either develop your own
	 * Learner Management System or would like to test and run your tutor standalone.
	 * NOTE! This version will NOT call initTutor since that is the responsibility
	 * of the author in this case.
	 */
	if (CTATTarget=="Default")
	{
		// initTutor ();

		// Once all the CTAT code has been loaded allow developers to activate custom code
		// All developers would have to do is provde the method called 'init'. This is a
		// better way of managing the order of execution since the ready function essentially
		// overwrites the body onLoad function

		if (window.hasOwnProperty('ctatOnload'))
		{
			window ['ctatOnload']();
		}
		else
		{
			console.log ("Warning: window.ctatOnload is not available");
		}

		return;
	}
}

/**
 *
 */
function OLIReady ()
{
	console.log ("OLIReady ()");

	CTATLMS.init.OLI();
	if (window.hasOwnProperty('ctatPreload'))
	{
		window['ctatPreload']();
	}

	// delay initTutor() call until ctatPreload in tutor.html has retrieved the problem data ...
	// initTutor (flashVars.getRawFlashVars());

	// Once all the CTAT code has been loaded allow developers to activate custom code
	// All developers would have to do is provde the method called 'init'. This is a
	// better way of managing the order of execution since the ready function essentially
	// overwrites the body onLoad function

	if (window.hasOwnProperty('ctatOnload'))
	{
		window ['ctatOnload']();
	}
	else
	{
		console.log ("Warning: window.ctatOnload is not available");
	}
}

//>---------------------------------------------------------------------------------
//Below we setup the two main events handlers that govern the execution cycle of
//a tutor. ready() is called whenever the main html has been loaded by the browser but
//not executed. load() is called when all css and js files have been loaded and parsed,
//including all the ones we told the browser to load in loadCTAT ()
//>---------------------------------------------------------------------------------

if (window.jQuery) 
{
    // jQuery is loaded 
	//console.log ("JQuery check: available, assining document ready event handler ...");
		
	/**
	 *
	 */
	$(document).ready(function() 
	{
		console.log ("ready ("+CTATTarget+")");

		if (location.search) // checking for querystring part of the URL
		{
			var str = location.search;

			console.log ("Query String: " + str);

			var query = str.charAt(0) == '?' ? str.substring(1) : str;

			if (query)
			{
				var fields = query.split('&');

				for (var f = 0; f < fields.length; f++)
				{
					var field = fields[f].split('=');
					var key = decodeURIComponent(field[0]);
					var value = decodeURIComponent(field[1].replace(/\+/g, ' '));

					console.log ("Adding configuration option: " + key + " [" + value + "]");

					authoringQuery [key] = value;
				}
			}

			if (authoringQuery ['mode'])
			{
				if (authoringQuery ['mode']=='auth')
				{
					CTATTarget="AUTHORING";
				}

				if (authoringQuery ['mode']=='SCORM')
				{
					CTATTarget="SCORM";
				}
			}
		}

		//if(window.frameElement && window.frameElement.getAttribute("data-superactivityserver"))
		if (CTATLMS.is.OLI())
		{
			CTATTarget = "OLI";
		}

		if (CTATTarget=="CTAT")
		{
			console.log ("Checking target: " + CTATTarget);

			if (window ['XBlock'])
			{
				console.log ("Forcing target platform to be XBlock, loadCTAT () will be called by the EdX Xblock code ...");

				CTATTarget="XBlock";
				return;
			}
			else
			{
				console.log ("window ['XBlock'] is not XBlock: " + window ['XBlock'] + "; CTATTarget is " + CTATTarget);
			}
		}

		if (CTATTarget=="OLI")
		{
			loadCTAT ();
			initOnLoad();
		}
		else
		{
			console.log ("We can't execute loadCTAT () in $(document).ready(), because the actual XBlock or JS needs to start first. It will call loadCTAT instead");
		}
	});
	
}
else
{
	// We handle the actual alert in the scrim code because we might use the ctat library in a non-tutoring
	// context
	console.log ("Error: JQuery not available, can't execute $(document).ready() in ctatloader.js");
}

/**
 *
 */
if (window.jQuery) 
{
	$(window).load(function() 
	{
		console.log ("load ()");

		// Load any static resources you need for this tutor. For example the OLI version
		// uses this time to generate a static reference to the BRD file so that it can
		// assign it to the question_file FlashVar

		if (CTATTarget=="XBlock" || CTATTarget=="OLI")
		{
			console.log ("We should not call initOnload in the XBlock case since that is all driven by CTATXBlock and the loadCTAT code above");
		}
		else
		{
			loadCTAT ();
			initOnload ();
		}
	});
}
else
{
	console.log ("Error: JQuery not available, can't execute $(window).load()");
}	

/**
 *
 */
function translateResourceFile (aURL)
{
	if (CTATTarget=="OLI")
	{
		return (oliDriver.translateOLIResourceFile (aURL));
	}

	/*if (CTATTarget=="XBlock") // relative urls now work
	{
		return (xblockpointer.translateResourceFile (aURL));
	}*/

	return (aURL);
}
