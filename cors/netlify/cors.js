const axios = require('axios');
exports.handler = async (event, context) => {
  var url = event.path;
  url = url.split(".netlify/functions/cors/")[1];
  url = decodeURIComponent(url);
  var urlBak = url;
  url = new URL(url);
  
  for( let i in event.queryStringParameters) {
     url.searchParams.append(i, event.queryStringParameters[i]);
  }

  var cookie_string = event.headers.cookie || "";
  var useragent = event.headers["user-agent"] || "";


let headers_to_send = {
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json', //optional
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '8640'
}


/*
  var headers_to_send = {
    "Cookie": cookie_string,
    "User-Agent": useragent,
    "Access-Control-Allow-Origin": "*",
    "content-type": "application/json",
    "accept": 
    "host": url.host
  }
*/

  var options = {
     method: event.httpMethod.toUpperCase(),
     header: headers_to_send,
     body: event.body
  }


  if( event.httpMethod == "GET" || event.httpMethod.toUpperCase() == "HEAD") delete options.body;

  var response = await axios.get(urlBak, options);
  //console.log(response.data);
  var headers = response.headers;
  var cookie_header = null;
  
  //if(headers["set-cookie"]) cookie_header = headers["set-cookie"]

  return {
    statusCode: 200,
    body: response.data,
    headers: {
	 "content-type": String(headers["content-type"]) || "text/plain",
         'Access-Control-Allow-Origin' : '*',
    },
    multiValueHeaders: {
       "set-cookie": cookie_header || []
    }
  }

};

