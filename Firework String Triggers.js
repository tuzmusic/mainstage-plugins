/*
This plugin enables the string part in the chorus of Katy Perry’s “Firework”
to be played with one hand, adding the appropriate bass notes on each strong beat.
*/


var triggerSets = [["C3","A#2"],["C3","C#3"],["G#2","A#2"],["G#2","A#2"]]
var createdNotes = ["G#1","A#1","F1","G#1"]
var setTriggerNotes = ["F2","C2","C#2","D#2"]

var currentSet = 0
var triggering = false 

function HandleMIDI(event)
{
	if (event instanceof Note) {  // Note events include NoteOn and NoteOff
		// if a note is played that should trigger another note, trigger that note
		if (triggerSets[currentSet].includes(MIDI.noteName(event.pitch))) {
  		  
  		  // create and send the note to be triggered
  			var newNote = (event instanceof NoteOn) ? new NoteOn(event) : new NoteOff(event)
  			newNote.pitch = MIDI.noteNumber(createdNotes[currentSet])
  			newNote.send()
  			
  			// for safety, release any previously triggered notes
  			// whose NoteOff would otherwise no longer be generated
  			// because we’ve moved on to a new trigger
  			const oldSet = currentSet == 0 ? 3 : currentSet - 1 // if we’re in set 0, we had 
        const offPitch = createdNotes[oldSet]               // looped around from set 3
        if (offPitch != createdNotes[currentSet]) {
          const off = new NoteOff(event)
          off.pitch = MIDI.noteNumber(createdNotes[oldSet])
          off.send()
        }
  		} 
  		// if a note is played that should go to the next set of notes, go to the next set of notes
		else if (MIDI.noteName(event.pitch) == setTriggerNotes[currentSet]) {
        currentSet = currentSet == 3 ? 0 : currentSet + 1   // after set 3 return to set 0
  		}
  }

	event.send()  // pass through all events (including whatever note was played)
}
