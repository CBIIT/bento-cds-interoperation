const express = require("express");
const router = express.Router();
const config = require("../config");

// GET ping-pong for health check
router.get("/ping", function (req, res, next) {
  res.send(`pong`);
});

// GET app version
router.get("/version", function (req, res, next) {
  res.json({
    version: config.VERSION,
    date: config.DATE,
  });
});

if (config.DEV_MODE){
  router.get("/test-error", function (req, res, next) {
    throw new Error("Test error");
  });
}

module.exports = router;
