function test() {
  Logger.log(ebeLookup(9786180330199));
}

let cacheVersion = '2';

function versionIt(isbn) {
  return `${isbn}.${cacheVersion}`;
}

function getCached(isbn) {
  return JSON.parse(CacheService.getDocumentCache().get(versionIt(isbn)));
}

function putCache(isbn, obj) {
  CacheService.getDocumentCache().put(versionIt(isbn), JSON.stringify(obj));
}

//
// Perform a POST request to the National Library of Greece. There's no API per se so, we'll parse the html output.
//
function ebe_request(isbn) {
  let formData = {
    'mode': 'tous',
    'typdoc': '',
    'count': 1,
    'user_query': isbn.toString()
  };

  // Because payload is a JavaScript object, it is interpreted as
  // as form data. (No need to specify contentType; it automatically
  // defaults to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  let options = {
    'method' : 'post',
    'payload' : formData
  };
  let response = UrlFetchApp.fetch('https://isbn.nlg.gr/index.php?lvl=more_results', options);
  //Logger.log(response.getAllHeaders());
  return response;
}

function ebe_parse(response) {
  let html = response.getContentText();

  const cheeriodoc = Cheerio.load(html);

  return {
    'title': cheeriodoc('.public_title').first().text()
  }
}

function ebeLookupOne(isbn) {
  if (isbn == "") {
    return;
  }

  Logger.log("Looking up: " + isbn);

  let cached = getCached(isbn);
  if (cached) {
    Logger.log(`Found ${isbn} in cache: ${cached.title}`);
    return cached.title;
  } else {
    let parsed = ebe_parse(ebe_request(isbn))
    putCache(isbn, parsed);
    return parsed.title;
  }
}

function ebeLookup(isbn) {
  return Array.isArray(isbn) ?
      isbn.map(row => ebeLookupOne(row)) :
      ebeLookupOne(isbn);
}
