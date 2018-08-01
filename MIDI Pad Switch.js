
/*
This plugin allows a user to select which channels are sounding in a MainStage setup with 8 sounds on 8 channels
using buttons and drum pads (8 each) on a MIDI Controller keyboard to send MIDI CC's (Continuous Controller Messages)

CCs have a number and a value; each between 0 and 127.
The drum pads are "momentary", sending a CC with value 127 when pressed and CC with value 0 when released.
The buttons are "toggle", sending alternately a CC with value 127 and a CC with value 0 on each press.
The buttons and pads are each assigned to 8 consecutive CC numbers. (21-28, 32-39)

The plugin is placed on each channel, with user-interface settings for each channel that designate the channel number, 
as well as the starting CC number for the buttons and for the pads.
*/


/*	--- DEFINE PARAMS	 --- */
// User interface objects

// Slider to select the "position" of the current channel (1-8)
var numOf8Selector = {
name:"Position",
type:"lin",
minValue:1, maxValue:8, numberOfSteps:7,
defaultValue:1
}

// Slider to select the starting CCs for buttons (which will mute and unmute each channel)
var muteCCSelector = {
name:"Starting CC for Mutes",
type:"lin",
minValue:0, maxValue:127, numberOfSteps:127,
defaultValue:21
}

// Slider to select the starting CCs for pads (which will solo each channel)
var soloCCSelector = {
name:"Starting CC for Solos",
type:"lin",
minValue:0, maxValue:127, numberOfSteps:127,
defaultValue:32
}
var PluginParameters = [numOf8Selector, muteCCSelector, soloCCSelector]

/*	--- SET VARIABLES	 --- */
// default values 
// which will be changed when the plugin is loaded and ParameterChanged is called
var positionNum = 1
var soloStart = 32
var muteStart = 21

var soloEnd = soloStart + 7
var muteEnd = muteStart + 7

// The actual CC number that should solo/mute this channel
var soloNum = soloStart + positionNum - 1
var muteNum = muteStart + positionNum - 1

// The mute state for the channel
var muted = true

/*	--- GET VALUES FROM PARAMETERS	 --- */

function ParameterChanged(param, value) {
// ParameterChanged is called for each PluginParameter when the Mainstage setup is loaded
// to read the values of the user interface  items from the PluginParameters array, defined above
// param is the index of the parameter in the PluginParameters array 
// value is the value of that parameter
	switch (param) {
		case 0: positionNum = value; break
		case 1: muteStart = value; break
		case 2: soloStart = value; break
	} // switch (param)
	
	// TO-DO: Make these computed variables so they don’t need to be called here.
	soloNum = soloStart + positionNum - 1
	muteNum = muteStart + positionNum - 1
	soloEnd = soloStart + 7
	muteEnd = muteStart + 7
	
} // ParameterChanged

/*	--- HANDLE MIDI	 --- */

function HandleMIDI(event) {
// HandleMIDI is called each time a MIDI event is sent 
// The main MIDI events are Note events (including NoteOn and NoteOff) and ControlChange events,
// aka CC’s (for our buttons and pads, among other things like pedals and other controllers)


	if (event instanceof ControlChange) {	 	 
    if (event.number == muteNum) {          // if this channel’s mute button has been hit
      muted = !(event.value == 127)         // mute or unmute the channel, depending on the CC value
      // TO-DO: try replacing this with ‘muted = !muted’ and making that work.
    } else if (soloStart <= event.number    
              && event.number <= soloEnd)   // if any solo pad has been hit
    { 
      muted = !(event.number == soloNum)    // set the mute state for this channel depending on the CC number
      // i.e., when a solo pad is hit, leave this channel unmuted if the pad is “our” pad
      // Since this plugin is on all channels, all channels but the chosen channel will be muted
      // TO-DO: consider renaming ‘muted’ as ‘unmuted’ and reverse the booleans
    }
 }
		   
	else if (event instanceof NoteOn == false || muted == false) {
	  // Let all none-NoteOn events pass through, 
	  // and only let NoteOn events pass through if this channel isn’t muted
		event.send()	
	}
}