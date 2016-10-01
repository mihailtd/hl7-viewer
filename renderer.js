// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict'
const $ = require('jquery');
const {clipboard, ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;
const alertify = require('alertify.js');
const hl7 = require('simple-hl7');
const hl7Definitons = require('hl7-dictionary').definitions['2.7.1'];
const server = hl7.Server;
const configuration = require('./configuration');
const _ = require('lodash');

const parser = new hl7.Parser({ segmentSeperator: '\n' });
const fs = require('fs');
const tcpClient = server.createTcpClient();
alertify.maxLogItems(10);


let refreshDestinations = () => {
  let destinations = configuration.readSettings('tcp-destinations');
  let html = '';
  destinations.forEach((dest, i) => {
    html += `<a href="#" data-destination="${i}">${dest.name}</a>`
  });

  $('.dropdown-content').html(html);
  $('.dropdown-content').find('a').on('click', function (event) {
    let i = $(this).data('destination');

    tcpClient.connect(destinations[i].ip, destinations[i].port);
    tcpClient.client.on('error', err => {
      return alertify.error(`${err}`);
    });
    tcpClient.send(msg.parse().toString() + '\n');
    alertify.success(`Message sent to ${destinations[i].name}`);
    tcpClient.close(msg.parse().toString() === msg.text);
  });
}
let refreshScale = () => {
  let uiScale = configuration.readSettings('ui-scale');
  $('html').css('zoom', uiScale);
}
refreshDestinations();
refreshScale();

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

let msg = new Message();
let messageBox = $('#message');
let lastActive = '0';

messageBox.on('DOMSubtreeModified', () => {
  msg.text = messageBox.text();
  refreshViews();
  let segments = messageBox.children('p');
  addEvents(segments);
  setActive(lastActive);
});

let addEvents = (segments) => {
  segments.on('click', function (evt) {
    evt.stopImmediatePropagation();
    lastActive = $(this).index();
    setActive(lastActive);
  });
}

$('.tabs').on('DOMSubtreeModified', () => {
  $('#detailTableMSH').find("div[contenteditable='true']").on('keyup', function (event) {
    event.stopImmediatePropagation();
    let val = $(this).text();
    
    setMessageSegmentValue(msg, 'PID', 1, 'testing')
  });
});

let setActive = (i) => {
  if (!i) {
    i = 0;
  }
  let lastActiveTab = $('.tabs').children()[i];
  if (!lastActiveTab) {
    lastActiveTab = $('.tabs').children()[0];
    lastActiveTab.children[0].checked = true;
    return;
  }
  lastActiveTab.children[0].checked = true;
}


let refreshViews = () => {
  constructHeaders(msg.getAllSegments());
  constructMshData(msg.getHeaderData());
  msg.parse().segments.forEach((seg, i) => {
    constructSegmentData(seg, i);
  });
}

let setMessageSegmentValue = (msg, seg, field, val) => {
  let parsedMsg = msg.parse();
  parsedMsg.getSegment(seg).editField(field, val);

  let text = parsedMsg.toString();
  msg.text = text;
  messageBox.children().remove();
  messageBox.html(formatHl7(text));
  refreshViews();
  removeEmptyParagraphs(messageBox);
}

let getTextFromMessageBox = () => {
  return $('#message').val();
}


$('#open').on('click', () => {
  lastActive = '0';
  dialog.showOpenDialog({ title: "Open Message", properties: ['openFile'], filters: [{ name: 'hl7 messages', extensions: ['hl7', 'txt'] }] }, path => {
    if (!path) {
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
      refreshViews();
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

// $('#send').on('click', () => {
//   tcpClient.connect('127.0.0.1', 6661);
//   tcpClient.send(msg.text);
//   alertify.success("Sent");
// });

$('#paste').on('click', () => {
  lastActive = '0';
  let text = clipboard.readText();
  msg.text = text;
  messageBox.children().remove();
  messageBox.html(formatHl7(text));
  refreshViews();
  removeEmptyParagraphs(messageBox);
  $('#MSH').prop("checked", true);
});

let constructMshData = header => {
  $('#detailTableMSH tbody').children().remove();
  let html = ``;
  header.fields.forEach((f, i) => {
    if (!f.value[0]) {
      return;
    }
    f.value[0].forEach((v, j) => {
      html += `<tr>
      <td data-column="segment">MSH-${i + 3}.${j + 1}</td>
      <td data-column="value"><div>${v.value[0]}</div></td>
      <td data-ccolumn="definition">${hl7Definitons.segments.MSH.fields[i + 2].desc}</td>
      <td data-ccolumn="actions">
        <button class="grow_spin button-edit" data-segment="MSH"><i class="fa fa-pencil" aria-hidden="true"></i></button>
        <button class="grow_spin button-copy"><i class="fa fa-copy" aria-hidden="true"></i></button>
        <button class="grow_spin button-edit-accept"><i class="fa fa-check" aria-hidden="true"></i></button>
        <button class="grow_spin button-edit-cancel"><i class="fa fa-ban" aria-hidden="true"></i></button>
      </td></tr>`
    });
  });
  $('#detailTableMSH tbody').append(html);
  $('.button-edit-accept').hide();
  $('.button-edit-cancel').hide();
  addEventsToButtons();
}

let constructSegmentData = (seg, i) => {
  let html = ` <table>
            <thead>
              <tr>
                <th>Segment</th>
                <th>Value</th>
                <th>Definition</th>
              </tr>
            </thead>
            <tbody>`;
  let contentDiv = $(`#SEG${i}`);
  let msgFields = seg.fields;
  let name = seg.name;
  msgFields.forEach((f, j) => {
    f.value.forEach((v, k) => {
      if (v.value) {
        v.value.forEach((v, m) => {
          v.forEach((c, n) => {
            html += `<tr><td>${name}-${j + 1}.${k + 1}.${m + 1 + n}</td><td><div contenteditable="true">${c.value[0]}</div></td>
            <td>${_.get(hl7Definitons.segments, name).fields[j].desc}</td></tr>`;
            return;
          });
        });
      }
      if (v.length === 1) {
        html += `<tr><td>${name}-${j + 1}.${k + 1}</td><td><div contenteditable="true">${v[0].value[0]}</div></td>
        <td>${_.get(hl7Definitons.segments, name).fields[j].desc}</td></tr>`;
        return;
      }
      if (v.length > 1) {
        v.forEach((c, l) => {
          html += `<tr><td>${name}-${j + 1}.${k + 1 + l}</td><td><div contenteditable="true">${c.value[0]}</div></td>
          <td>${_.get(hl7Definitons.segments, name).fields[j].desc}</td></tr>`;
          return;
        })
      }
    });
  });
  html += `</tbody>
          </table>`
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
  return '<p tabindex="1">' + text
    .split('|').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">|</span>')
    .split('^').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">^</span>')
    .split('~').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">~</span>')
    .split('\\').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">\\</span>')
    .split('&').join('<span style="font-weight: 800; font-size: 1.5em; color: #666">&</span>')
    .split('\n').join('</p><p>');
}

let removeEmptyParagraphs = el => {
  if (!el.children('p')) {
    return;
  }
  el.children('p').each(function () {
    if ('' === $.trim($(this).text())) {
      $(this).remove();
    }
  });
}

$('#settings').on('click', () => {
  ipcRenderer.send('events', 'settings-open');
});
messageBox.on('focus', () => {
  ipcRenderer.send('events', 'focused');
});
messageBox.on('blur', () => {
  ipcRenderer.send('events', 'blurred');
});
ipcRenderer.on('events', (event, arg) => {
  if (arg === 'pressed') {
    $('#paste').click();
    return;
  }
  if (arg === 'settings-close') {
    return refreshDestinations();
    // alertify.success("Settings Saved and Applied");
  }
  if (arg === 'settings-change-scale') {
    return refreshScale();
  }
});


let addEventsToButtons = () => {
  $('.button-edit').on('click', function() {
    let valueColumn = $(this).parent().siblings().filter( function () { return $(this).data('column') === 'value' });
    valueColumn.attr('contenteditable','true');
    $(this).hide();
    $(this).siblings('.button-copy').hide();
    $(this).siblings('.button-edit-accept').show();
    $(this).siblings('.button-edit-cancel').show();
    let value = valueColumn.text();
  });

  $('.button-copy').on('click', function() {
    let value = $(this).parent().siblings().filter( function () { return $(this).data('column') === 'value' }).text();
    clipboard.writeText(value);
    alertify.success(`"${value}" copied to clipboard!`);
  });
}