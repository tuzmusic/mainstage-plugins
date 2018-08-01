/*--- SOLO SCRIPT FOR TOP KEYBOARD, 4 SOUNDS ---*/

/*
This plugin allows a user to select which channels are sounding in a MainStage setup with 4 sounds on 4 channels,
and also to add a note an octave below for any channel.
using pads on a MIDI Controller keyboard to send MIDI CC's (Continuous Controller Messages)

CCs have a number and a value; each between 0 and 127.
The pads are each assigned to 4 consecutive CC numbers.

The plugin is placed on each channel, with user-interface settings for each channel that designate the channel number, 
as well as the starting CC number for the pads.
*/

/*  --- DEFINE PARAMS     --- */
// User interface objects

// Slider to select the "position" of the current channel (1-4)
var numOf4Selector = {
name:"Position",
type:"lin",
minValue:1, maxValue:4, numberOfSteps:3,
defaultValue:1
}

// Slider to select the starting CCs for pads (which will solo each channel)
var soloCCSelector = {
name:"Starting CC for ALL Solo Pads",
type:"lin",
minValue:0, maxValue:127, numberOfSteps:127,
defaultValue:32
}
var PluginParameters = [numOf8Selector, soloCCSelector]

/*  --- SET VARIABLES     --- */
// default values 
// which will be changed when the plugin is loaded and ParameterChanged is called
var positionNum = 1
var soloStart = 32
var soloEnd = soloStart + 7

// The actual CC numbers that should solo this channel, and add the octave
var soloNum = soloStart + 4 + positionNum - 1
var octaveNum = soloNum - 4

// The mute and “octave added” states for the channel
var muted = true
var plus8vb = false

/*  --- GET VALUES FROM PARAMETERS     --- */

function ParameterChanged(param, value) {
// ParameterChanged is called for each PluginParameter when the Mainstage setup is loaded
// to read the values of the user interface  items from the PluginParameters array, defined above
// param is the index of the parameter in the PluginParameters array 
// value is the value of that parameter
    switch (param) {
        case 0: positionNum = value; break
        case 1: soloStart = value
            break
    } // switch (param)
    
    	// TO-DO: Make these computed variables so they don’t need to be called here.
    soloEnd = soloStart + 7
    soloNum = soloStart + 4 + positionNum - 1
    octaveNum = soloNum - 4
    
} // ParameterChanged

/*  --- HANDLE MIDI     --- */



function HandleMIDI(event)
{
// HandleMIDI is called each time a MIDI event is sent 
// The main MIDI events are Note events (including NoteOn and NoteOff) and ControlChange events,
// aka CC’s (for our buttons and pads, among other things like pedals and other controllers)
    
    if (event instanceof ControlChange) {
        if (soloStart <= event.number 
            && event.number <= soloEnd    
            && event.value == 127)    // if a relevant pad has been hit
        {
            
            switch (event.number) {   // set the muted and plus8vb states 
                case soloNum:         // depending on the CC number
                    muted = false; plus8vb = false
                    break
                case octaveNum:
                    muted = false; plus8vb = true
                    break
                default:              // if it’s not this channel’s soloNum or octaveNum,
                    muted = true      // the channel stays muted
                    break
            } //switch
            traceMutes(event)
        }
                
        else { // all other CC's
            event.send()
        }
        
    } // filter out all pads/buttons
    
   else if (event instanceof NoteOn) {  // when a note is played
        if (muted == false) {           // if this channel isn’t muted
            event.send()                // let the note pass through
            if (plus8vb) {              // if we’re adding the octave
                var octave = new NoteOn(event)
                octave.pitch -= 12      // create a new note an octave lower
                octave.send()           // and play it
            }
        }
    } else if (event instanceof NoteOff) {    // when a note is released
        event.send()                          // let the NoteOff pass through                    
        if (plus8vb) {                        // if we’ve added the octave
            var octave = new NoteOff(event)
            octave.pitch -= 12                // create a new NoteOff message an octave lower
            octave.send()                     // and send it to release the extra note
        }
    } else {
        event.send()    // let all other events pass through
    }
}

// This is called when the Mainstage setup is selected, to reset the state of each channel
// The starting state for the setup has Channel 1 unmuted, and with only the main octave
function Reset () {
    traceMutes("Reset")
    plus8vb = false
    if (positionNum == 1) {
        muted = false
    }
}

// For debugging
function traceMutes(event) {
    var string = names[positionNum] + " - "
    string += "CC #" + event.number
    string += " (" + event.value + "), "
    string += "muted = " + muted
    string += ", plus8vb = " + plus8vb
    Trace(string)
}