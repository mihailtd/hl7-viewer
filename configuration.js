let saveSettings = (settingKey, settingValue) => {
  nconf.set(settingKey, settingValue);
  nconf.save();
}

let readSettings = settingKey => {
  nconf.load();
  return nconf.get(settingKey);
}

let getUserHome = () => {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var nconf = require('nconf').file({ file: getUserHome() + '/hl7-viewer-config.json' });

module.exports = {
  saveSettings: saveSettings,
  readSettings: readSettings
};