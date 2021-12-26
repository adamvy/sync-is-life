import express from "express";

let app = express();

let index = `<!DOCTYPE html>
<html>
<head>
  <script src="client.js"></script>
</head>
</html>
`;

app.use(function (req, res, next) {
  res.set("cross-origin-opener-policy", "same-origin");
  res.set("cross-origin-embedder-policy", "require-corp");
  next();
});

app.use(express.static("."));

app.listen(8080);
