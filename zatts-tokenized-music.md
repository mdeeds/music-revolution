# Zatt's Tokenized Music - Design Specification
  
This document outlines the format used by the Zatt's MIDI Logger
application to record and playback MIDI events. This format is
designed for simplicity and readability, prioritizing LLM interfacing
over strict adherence to MIDI specifications.
  
## Data Structure:
  
Zatt's Tokenized Music is a text format containing a sequence of
events, each separated by whitespace characters. Each event is
represented by three data points:
  
Time Delta: This value represents the time difference, in twelfths of
a beat, between the current event and the previous event. The first
event has a time delta of 0.
  
Note Duration: This value represents the duration of the note, in
twelfths of a beat.
  
Note Name: This is the name of the note, expressed in standard musical
notation (e.g., C4, D#5, A3).
  
Example:

```
0 48 C4 12 24 D4 24 12 E4
```
  
Interpretation:

The first note, C4, starts at the beginning of the recording and has a
duration of 48 twelfths of a beat (4 beats).  The second note, D4,
starts after 12 twelfths of a beat (1 beat) and has a duration of 24
twelfths of a beat (two beats).  The third note, E4, starts after 36
twelfths of a beat (three beats) and has a duration of 12 twelfths of
a beat (one beat).

## Assumptions
    
Tempo: The tempo is assumed to be the BPM specified in the application
settings, which defaults to 120 BPM.

MIDI Channel: The software records input from all MIDI channels. The
MIDI channel is not encoded in the output.

Time Signature: The metronome time signature is defined in code and
set to 4 beats per measure.  (E.g. 4/4)
  
## Notes
  
The format is intended to be easily tokenized by LLMs, making it easy
to understand the sequence of notes and their durations.
  
The use of twelfths of a beat allows encoding sixteenth notes and
eigth note triplets accurately. The durations are quantized to improve
LLM comprehension.

Example ZTM duration for notes with one quarter note per beat:

| standard musical notation | ZTM duration |
| ------------------------- | ------------ |
| sixteenth-note            |            3 |
| eighth-note triplet       |            4 |
| eighth-note               |            6 |
| quarter-note-triplet      |            8 |
| dotted-eighth             |            9 |
| quarter-note              |           12 |
| half-note-triplet         |           16 |
| dotted-quarter-note       |           18 |
| half-note                 |           24 |
| dotted-half-note          |           36 |
| whole-note                |           48 |  
  
The text format is lightweight and easily processed by the software.
  
The format is not meant to be a full MIDI representation, as it
excludes details like velocity, MIDI channel information, or other
MIDI events like controller changes.
  
## Future Considerations

The format could be extended to include additional MIDI information
such as velocity, pitch bend, and sustain pedal.

The application could be extended to support different time signatures and tempos.

