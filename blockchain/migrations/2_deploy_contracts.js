const DeviceRegistry = artifacts.require("DeviceRegistry");

module.exports = function (deployer) {
  deployer.deploy(DeviceRegistry);
};