# TCP server

## Minimum requirement:
- TCP server takes in any request text per line and send a query to an external API, until client send 'quit' or timed out.
- TCP server can accept multiple connections at the same time.
- Mock external API: 30 requests per second.

## Going deeper:
- Consider the external API could be unreachable or unavailable.
- Mount a HTTP endpoint on your server and display some statistics: current connection count, current request rate, processed request count, remaing jobs...etc

## Server host
http://localhost:4000

## Install module
```bash
$ npm install
```

## Run server
```bash
$ npm start
```

## Stop all server
```bash
$ npm stop
```