import http from "http";
import fs from "fs";
import path from "path";
import mime from "mime";

const cache = {};

function send404(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    { "content-type": mime.lookup(path.basename(filePath)) }
  );
  response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) { sendFile(response, absPath, cache[absPath]); return }

  fs.exists(absPath, (exists) => {
    if (!exists) { send404(response); return }

    fs.readFile(absPath, (err, data) => {
      if (err) { send404(response); return }

      cache[absPath] = data;
      sendFile(response, absPath, data);
    });
  });
}

const server = http.createServer((request, response) => {
  const filePath = (() => {
    if (request.url == '/') { return 'public/index.html'; }
    return 'public' + request.url;
  })();
  const absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

server.listen(3000, () => {
  console.log('Server listening on port 3000.')
})
