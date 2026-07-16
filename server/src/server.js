require("dotenv").config();
const app = require("./app");
const wsHub = require("./lib/ws-hub");

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`VPCC Việt An server đang chạy tại http://localhost:${port}`);
});
wsHub.init(server);
