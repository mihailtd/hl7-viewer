# HL7 Viewer


## Features:

* Easily see a clear formatted HL7 message.
* Nice user interface, with light and dark theme.
* Very responsive, real time edits of the messages.
* TCP/IP sending of messages. Edit and send the message from a single application makes it very conveninet
for testing environments and more. You can setup and save destinations that can have aliases for easy 
reference.
* Quickly open or save your edited file to the disk. You can open .hl7 and .txt files. 

## What's new:

* Fixed the send dropdown display and styles. 
* Dynamically loading the TCP destinatios that you setup in the settings window.

## Known issues and unfinished features in this beta version:

* TCP send button, dropdown menu is not functional.
* Editing beyond the scope of the original message (adding new segments from the message edit section) 
will not apply the correct formatting. Workaround: ctrl-a, ctrl-c, ctrl-v to reinsert the message and
have the formatting reapplied.
* The details pane table is not editable. This will be editable and the edits will show in the message 
edit section real time.
* The 'Standard' column displays a placeholder at the moment. This will display the description of
the usual value in this field.
* The light theme will come in a future version.
* UI scale slider is not implemented yet. Currently the UI elements are big to facilitate high resolution
screens. In the future there will be a slider to adjust the scale of the UI elements.
* Proper installers and releases for linux and mac are coming soon. For now the beta version is available 
only on Windows systems.

## Installation instructions:

* Download the .rar [file](./packages/).
* Extract to a folder.
* Run `hl7-viewer.exe`.
* This version does not yet have automatic updates. Make sure to check this repo regurarly for 
possible updates.


I am trying to solve problems that I encounter daily, make the process of debugging and testing 
with hl7 messages a fast and seamless process. I hope this application will help professionals 
in the healthcare community, and others.

### Thank you!
