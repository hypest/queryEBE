function test() {
  Logger.log(ebeLookup(9786180330199));
}

let cacheVersion = '5';

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
  return response;
}

function ebe_parse(response) {
  let html = response.getContentText();

  const cheeriodoc = Cheerio.load(html);

  return {
    'title': cheeriodoc('.public_title').first().text()
  }
}

function test3() {
  getImage('9786180330199');
}

function getImageUrl(isbn) {
  const url = `https://www.google.com/search?q=${isbn}&source=lnms&tbm=isch`
  const response = UrlFetchApp.fetch(url);
  const html = response.getContentText();
  const cheeriodoc = Cheerio.load(html);
  return cheeriodoc('img').eq(1).attr('src');
}

function ebeLookupOne(isbn) {
  if (isbn == "") {
    return;
  }

  Logger.log("Looking up: " + isbn);

  let cached = getCached(isbn);
  if (cached) {
    Logger.log(`Found ${isbn} in cache: ${cached.title}, ${cached.imgsrc}`);
    return Object.values(cached);
  } else {
    let parsed = ebe_parse(ebe_request(isbn))
    const result = {...parsed, 'imgsrc': getImageUrl(isbn)};
    Logger.log(`Caching: ${result.title}, ${result.imgsrc}`);
    putCache(isbn, result);
    return Object.values(parsed);
  }
}

function ebeLookup(isbn) {
  return Array.isArray(isbn) ?
      isbn.map(row => ebeLookupOne(row)) :
      ebeLookupOne(isbn);
}
