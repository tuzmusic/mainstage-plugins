/*
For use with MIDI Pad Switch plugin.
My MIDI Controller has buttons and pads that light up in response to MIDI CC messages.
When the CC value is 127 the light is green, when the value is 0 the light is off,
and everything in between turns the light red.

This plugin causes the buttons to show green for unmuted channels and red for muted channels.
The pads show the last solo’ed channel in red (with the rest of the pads in green)

In contrast to the MIDI Pad Switch plugin, I’ve supplied the starting and ending CC numbers
rather than getting them from the user. That could be implemented in a more public version.

TO-DO: Replace this with the updated version from my other computer.
*/


/* --- LIGHT CONTROL SCRIPT --- */

var red = 127
var green = 1

var soloTrack = 0
var activated = [true, false, false, false, false, false, false, false] 

/*  --- HANDLE MIDI	 --- */

function HandleMIDI(event) {	

// HandleMIDI is called each time a MIDI event is sent 
// The main MIDI events are Note events (including NoteOn and NoteOff) and ControlChange events,
// aka CC’s (for our buttons and pads, among other things like pedals and other controllers)
    
		if (event instanceof ControlChange && event.number == 29) { 
			ResetLights()
		}	
		if (isSoloPad(event)) {
			soloLight(event)
		} else if (isMuteButton(event)) {
			muteLight(event)
		}
	} 


/*  --- FUNCTIONS	 --- */

function isSoloPad(event) {
	return (event instanceof ControlChange && 32 <= event.number 
	        && event.number <= 39) 
}

function isMuteButton(event) {
	return (event instanceof ControlChange && 21 <= event.number 
          && event.number <= 28) 
}

function soloLight(event) {
	
	var soloLightNum = event.number - 11  // button 1 is 21, pad 1 is 32
	soloTrack = event.number - 32
	
	for (i = 21; i<29; i++) {
		var light = new ControlChange()
		light.number = i
		light.value = i == soloLightNum ? green : red
		light.send()

		activated[i - 21] = i == soloLightNum ? true : false
	}
	
}

function muteLight(event) {
	var light = new ControlChange(event)
	light.value = event.value == 127 ? green : red
	light.send()
	
	activated[event.number - 21] = event.value = 127 ? true : false
}

function ResetLights() {        // allow lights to be manually reset if anything’s gone wrong
	for (i = 0; i <= 7; i++) {
			// Set Mute Lights
			var muteLight = new ControlChange()
			muteLight.number = i + 21
			muteLight.value = activated[i] ? green : red
			muteLight.send()
			
			var soloLite = new ControlChange(muteLight)
			soloLite.number += 11
			//soloLite.send()
		}
}

// Called when the Mainstage setup is selected.
function Reset() {
	var resets = new ControlChange()
	resets.number = 32  // set the lights to the default state
	muteLight(resets)
	soloLight(resets)
}
