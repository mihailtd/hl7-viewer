'use strict';
const {ipcRenderer} = require('electron');
const $ = require('jquery');
const jQuery = require('jquery');
const mask = require('./jquery.mask.min');
const configuration = require('./configuration');
const alertify = require('alertify.js');



$(document).ready(() => {
  let theme = configuration.readSettings('theme');
  let uiScale;
  let destinations;

  let t = $('#destinations');
  let addEvents = () => {
    $('#add-row').on('click', () => {
      let destinationName = $('#destination-name').val();
      let destinationIp = $('#destination-ip').val();
      let destinationPort = $('#destination-port').val();
      if (!destinationName) { return alertify.error("Please Provide a Name!"); }
      if (!destinationIp) { return alertify.error("Please Provide an Ip!"); }
      if (!destinationPort) { return alertify.error("Please Provide a Port!"); }

      let destination = {
        'name': destinationName,
        'ip': destinationIp,
        'port': destinationPort,
      }
      destinations.push(destination);
      configuration.saveSettings('tcp-destinations', destinations);
      refreshDestinations();
      alertify.success("Destination Added!");
    });
    // $('.edit').on('click', function () {
    //   alertify.success("Edit Successful");
    // });
    $('.delete').on('click', function () {
      let index = $(this).data('destination');
      destinations.splice(index, 1);
      configuration.saveSettings('tcp-destinations', destinations);
      refreshDestinations();
      alertify.success("Destination Deleted");
    });
  };
  let refreshDestinations = () => {
    destinations = configuration.readSettings('tcp-destinations');
    if (destinations) {
      let html = ''
      destinations.forEach((dest, i) => {
        html += `<tr>
      <td>${dest.name}</td>
      <td>${dest.ip}</td>
      <td>${dest.port}</td>
      <td>
      <button class="grow_spin delete" data-destination="${i}"><i class="fa fa-trash-o" aria-hidden="true"></i></button>
      </td>
      </tr>`
      });
      html += `<tr>
      <td><input id="destination-name" type="text" name="name" placeholder="Name"/></td>
      <td><input id="destination-ip" type="text" name="ip" placeholder="IP"/></td>
      <td><input id="destination-port" type="number" name="port" placeholder="Port"/></td>
      <td>
      <button class="grow_spin" id="add-row"><i class="fa fa-plus" aria-hidden="true"></i></button>
      </td>
      </tr>`
      t.find('tbody').html(html);
      addEvents();
    }
  }



  refreshDestinations();

  let inputs = $('input[type=radio]');
  inputs.filter((i, el) => {
    return el.value === theme;
  }).prop('checked', 'true');


  $('#scale-slider').on("change", function (v) {
    configuration.saveSettings('ui-scale', $(this).val());
    refreshScale();
    setParrentScale();
  });

  let setParrentScale = () => {
    ipcRenderer.send('events', 'settings-change-scale');
  }

  let refreshScale = () => {
    uiScale = configuration.readSettings('ui-scale');
    $('html').css('zoom', uiScale);
    $('#scale-slider').val(uiScale);
    $('#scale').text(uiScale);
  }
  refreshScale();

  $('#close').on('click', () => {
    ipcRenderer.send('events', 'settings-close');
  });


  $('#destination-ip').mask('0ZZ.0ZZ.0ZZ.0ZZ', {
    translation: {
      'Z': {
        pattern: /[0-9]/, optional: true
      }
    }
  });
});

