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

* Dynamically loading the TCP destinatios that you setup in the settings window.
* Added the 'Definition' column to the details pane. It shows the definiton of each segment from the HL7 standard.
* This beta version is has builds for all major platforms. No proper installers yet, unpack and run. 
* UI Scale slider implemented. Change the size of UI elements in real time. No matter if you have a very low res 
screen or a high res one, you should find the perfect scale to match it. 

## Known issues and unfinished features in this beta version:

* TCP send button, dropdown menu is not functional.
* Editing beyond the scope of the original message (adding new segments from the message edit section) 
will not apply the correct formatting. Workaround: ctrl-a, ctrl-c, ctrl-v to reinsert the message and
have the formatting reapplied.
* The details pane table is not editable. This will be editable and the edits will show in the message 
edit section real time.
* The light theme will come in a future version.
* Proper installers coming soon and auto updates coming soon. 

## Installation instructions:

* Download the .rar [file](https://github.com/farcasmihai91/hl7-viewer/releases/tag/0.9.3).
* Extract it.
* Run `hl7-viewer.exe`.
* This version does not yet have automatic updates. Make sure to check this repo regurarly for 
possible updates.


I am trying to solve problems that I encounter daily, make the process of debugging and testing 
with hl7 messages a fast and seamless process. I hope this application will help professionals 
in the healthcare community, and others.

### Thank you!
