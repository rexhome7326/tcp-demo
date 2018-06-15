# TCP server

## Minimum requirement:
- TCP server takes in any request text per line and send a query to an external API, until client send 'quit' or timed out.
- TCP server can accept multiple connections at the same time.
- As for the external API, the choice is yours, or even a mock.
- We do have a API request rate limit for the external API: 30 requests per second.
- Try not to use 3rd-party libraries unless necessary.
- Your code should be runnable and functional in happy cases.

## Going deeper:
- Please consider the external API could be unreachable or unavailable.
- Mount a HTTP endpoint on your server and display some statistics: current connection count, current request rate, processed request count, remaing jobs...etc
- The rest is for you to show your strength in programming. e.g., tests, documents, user interface, architecture.

## Install module
```bash
$ npm install
$ 
```

## Run server
```bash
$ npm run start-mock
$ npm run start-tcp
$ npm run start-web
```

## Stop all server
```bash
$ npm stop
```