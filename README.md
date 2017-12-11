# A fool-proof step by step guide to a proxy geek.

## From _hello world_ to a general proxy service with request transformation.

## Prerequisites

* [Node.js 8.9 or later](https://nodejs.org/en/download/)
* run `npm install` under this folder, to install all the packages used.

## What is this?

* A request forwarding service that can transform request details.

_You send a request to the service, it transforms the request header/query parameters/uri if necessary, then request to a remote service and return the response to you._

## Use cases

* Add commonly used header and query paramaters to simplify requests.
* Simplifies authentication procedure. (can be set as a dedicated token and user credential server.)
* Hide the authentication details from end user, and force SSL encryption with sensitive info.
```
(The end user request url)
http://localhost:3000/locationiq/v1/search.php?q=UBC
 ->
(The hidden request url performed for response)
https://locationiq.org/v1/search.php?q=UBC&key=<api key>&format=json
```
* Make new version of standardized APIs without changing API backend.
```
(The end user request url)
DELETE /v2/table/123
 ->
(The hidden request url performed for response)
POST /v1/table/delete.json -d {id:123}
```
* Gather multiple services all in once and unify the APIs.
* http browse proxy.
* etc.

## How to use the step script files

* Simply run `node step#.js`, and use browser or Postman, Insomnia to make request on
  `https://localhost:3000`

## How to use the npm script defined

* Start the server (app.js) - `npm run start`
* Test the server (test.js) - `npm run test` after the server is started.

## Express based example

* There is also a version of tutorial in Express offered under [tutorial-in-express](https://github.com/azusa0127/node-proxy-tutorial/tree/master/tutorial-in-express).

## License

Copyright (c) 2017 Phoenix Song

This software is released under the MIT License. https://opensource.org/licenses/MIT
