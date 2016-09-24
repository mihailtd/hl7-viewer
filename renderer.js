// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict'
const $ = require('jquery');
const {clipboard} = require('electron')
const alertify = require('alertify.js');
const hl7 = require('simple-hl7');
const parser = new hl7.Parser({ segmentSeperator: '\n' });


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
  console.log(msg.text);
});

let refreshViews = (view) => {

}

let setMessageSegmentValue = (msg, seg, val) => {

}

let getTextFromMessageBox = () => {
  return $('#message').val();
}

$('#save').on('click', () => {
  alertify.success("Saved");
});

$('#send').on('click', () => {
  alertify.success("Sent");
});

$('#paste').on('click', () => {
  let text = clipboard.readText();
  messageBox.html(formatHl7(text));
  msg.text = text;
  constructHeaders(msg.getAllSegments());
});


let constructHeaders = headers => {
  let html;
  headers.forEach( (h, i) => {
    html += `<div class="tab"><input name="css-tabs" type="radio" class="tab-switch" id="SEG${i}">
    <label for="SEG${i}" class="tab-label">${h}</label>
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