// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict'
const $ = require('jquery');
const {clipboard, ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;
const alertify = require('alertify.js');
const hl7 = require('simple-hl7');
const parser = new hl7.Parser({ segmentSeperator: '\n' });
const fs = require('fs');


class Message {
  constructor() {
    this.text = "";
  }

  get text() {
    return this._text
  }

  set text(text) {
    this._text = text;
  }

  parse() {
    return parser.parse(this.text);
  }

  send(dest) {

  }

  saveToDisk() {

  }

  anonymize() {

  }

  getAllSegments() {
    return msg.parse().segments.map(s => s.name);
  }
  getSegmentData(seg) {
    return msg.parse().seg;
  }
  getHeaderData() {
    return msg.parse().header;
  }
}

class Destination {
  constructor(ip, port) {
    this._ip = ip;
    this._port = port;
  }

  get port() {
    return this._port;
  }

  set port(port) {
    this._port = port;
  }

  get ip() {
    return this._ip;
  }

  set ip(ip) {
    this._ip = ip;
  }

  save() {

  }
}

let msg = new Message();
let messageBox = $('#message');

messageBox.on('DOMSubtreeModified', () => {
  let segments = messageBox.children('p');
  segments.on('click', function (evt) {
    evt.stopImmediatePropagation();
    $('.tabs').children()[$(this).index()].children[0].checked = true;
  });
});

messageBox.on('focus', () => {
  ipcRenderer.send('events', 'focused');
});
messageBox.on('blur', () => {
  ipcRenderer.send('events', 'blurred');
});
ipcRenderer.on('events', (event, arg) => {
  if(arg === 'pressed');
  $('#paste').click();
})

let refreshViews = (view) => {

}

let setMessageSegmentValue = (msg, seg, val) => {

}

let getTextFromMessageBox = () => {
  return $('#message').val();
}


$('#open').on('click', () => {
  dialog.showOpenDialog({ title: "Open Message", properties: ['openFile'], filters: [{ name: 'hl7 messages', extensions: ['hl7', 'txt'] }] }, path => {
    if (!path[0]) {
      return alertify.log("No file selected!");
    }
    fs.readFile(path[0], 'utf8', (err, data) => {
      if (err) {
        return alertify.error(`Error reading file! ${err}`);
      }
      if (!data) {
        return alertify.log("Empty file!");
      }
      msg.text = data;
      if (msg.parse().header.fields.length === 0) {
        return alertify.error("Not a valid HL7 message!");
      }
      messageBox.html(formatHl7(data));
      constructHeaders(msg.getAllSegments());
      constructMshData(msg.getHeaderData());
      msg.parse().segments.forEach((seg, i) => {
        constructSegmentData(seg, i);
      });
      alertify.success("File opened!");
    });
  });
});

$('#save').on('click', () => {
  let messageText = $('#message').text();
  if (!messageText.trim().length) {
    return alertify.log("No message text!");
  }
  if (msg.parse().header.fields.length === 0) {
    return alertify.error("Not a valid HL7 message!");
  }
  dialog.showSaveDialog({ title: "Save Message", filters: [{ name: 'hl7 messages', extensions: ['hl7'] }, { name: 'txt', extensions: ['txt'] }] }, path => {
    if (!path) {
      return alertify.log("No file saved!");
    }
    fs.writeFile(path, messageText, err => {
      if (err) {
        return alertify.error(`Error writing file! ${err}`);
      }
      return alertify.success("File saved!");
    })
  });
});

$('#send').on('click', () => {
  alertify.success("Sent");
});

$('#paste').on('click', () => {
  let text = clipboard.readText();
  msg.text = text;

  messageBox.html(formatHl7(text));
  constructHeaders(msg.getAllSegments());
  constructMshData(msg.getHeaderData());
  msg.parse().segments.forEach((seg, i) => {
    constructSegmentData(seg, i);
  });
  $('#MSH').prop("checked", true);
});

let constructMshData = header => {
  let html = ``;
  header.fields.forEach((f, i) => {
    f.value[0].forEach((v, j) => {
      html += `<p>Segment ${i}.${j} has a value of ${v.value[0]}</p>`
    })

  });
  $('#MSH').siblings('.tab-content').html(html);
}

let constructSegmentData = (seg, i) => {
  let html = ``;
  let contentDiv = $(`#SEG${i}`);
  let fields = seg.fields;

  fields.forEach((f, j) => {
    f.value.forEach((v, k) => {
      if (v.value) {
        v.value.forEach((v, m) => {
          v.forEach((c, n) => {
            html += `<p>Segment ${i}-${j}.${k}.${m}.${n} has a value of ${c.value[0]}</p>`;
            return;
          })
        });
      }
      if (v.length === 1) {
        html += `<p>Segment ${i}-${j}.${k} has a value of ${v[0].value[0]}</p>`;
        return;
      }
      if (v.length > 1) {
        v.forEach((c, l) => {
          html += `<p>Segment ${i}-${j}.${k}.${l} has a value of ${c.value[0]}</p>`;
          return;
        })
      }
    });
  });
  contentDiv.siblings('.tab-content').html(html);
}

let constructHeaders = headers => {
  $('.tab:first').nextAll('.tab').remove();
  let html = ``;
  headers.forEach((h, i) => {
    html += `<div class="tab"><input name="css-tabs" type="radio" class="tab-switch" id="SEG${i}">
    <label for="SEG${i}" class="tab-label">${h}</label>
    <div class="tab-content"></div>
      </div>`
  });
  $('.tabs').append(html);
}

let formatHl7 = text => {
  return '<p>' + text
    .split('|').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">|</span>')
    .split('^').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">^</span>')
    .split('~').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">~</span>')
    .split('\\').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">\\</span>')
    .split('&').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">&</span>')
    .split('\n').join('</p><p>');
}