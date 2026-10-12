const Axios = require("axios");

setInterval(async () => {
  const requests = await Axios("api/v1/user/request");
  if (requests > 0) {
    console.log("it is working ");
  }
}, 5000);
