const dotenv = require("dotenv");
dotenv.load();

const app = require("./app");
const http = require("http");

const server = http.createServer(app.callback());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
