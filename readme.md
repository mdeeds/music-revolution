# Zatt's Musical Exchange

Zatt's Musical Exchange allows you to record and arrange music like a
DAW and collaborate in real time like a Google Doc, and it reads like
a lead sheet. Our core design principal is simplicity. This is
intended to be a modern composition book and tape recorder for
musicians.  We avoid menus and deep features in favor of clearly
displaying all of the most meaningful information and not hiding
settings and controls while keeping the user interface simple.
  
## Overview

This document is a design specification for a collaborative music
composition scratchpad.  Many components described here are divided
into milestones:

  * Prototype - The initial set of features for a working proof of
    concept

  * Beta - Something that can be released to a small number of people

  * MVP - A version that is ready for comment from our YouTube
    subscribers

The sections below describe in detail what goes in to each milestone.
We do not have a firm timeline for any milestone as this is a
completely volunteer effort.  However, we do try to stage the work so
that the "Prototype" is complete before "Beta" work begins.

## Details

### Application User Interface

The application is divided into three main areas:

  1) A menu and configuration bar

  2) The "huddle" room

  3) A work area

#### Menu and Configuration

This area has a button which will expand the settings for the project
and allow audio and MIDI input and output devices to be selected.

By default MIDI will be recorded from all channels on all input MIDI
devices.  This is represented by checked boxes next to the names of
all discovered MIDI inputs.  The primary purpose of MIDI input is to
create musical staff notation.  MIDI playback is not supported in the
early milestones.
  
Audio input is from a single source.  Initially this source is the
default audio input. All available audio inputs are enumerated and
listed in the configuration area, and input for music and voice may be
changed separately.

Audio output is also to a single source. Initially the source is the
default audio output, but other outputs may be selected.

[Project Properties] are also displayed here.

**Prototype**

Only a single audio source (default) is used.  There is nothing to configure.

**Beta**

Audio can be selected so that chat and music can be dedicated
to different audio sources.  (E.g. a headset microphone for chat, and
another audio interface for music.)

**MVP**
Latency for the music audio device can be adjusted.
  

#### The Huddle Room

Clicking on this room adds you name to the.  Your voice audio
source will be sent to all others in the huddle room in near real time.

The huddle room box it titled, "Huddle" and the names of all musicians
in the huddle room are inside the box.


#### Studios

Studios work like the huddle room, but the first musician to click on
the microphone in that room can record there as well.  The others in
the room will here the tracks that the recording musician plays and
what they are recording.  Recording creates new [Musical Phrases] which
are added to the [Work Area].

When the recording musician leaves the room, the microphone is free
for someone else to use.

**Prototype**

Phrases are created in-order and cannot be rearanged.  They can be
muted, but there is no sequencing.  All phrases play simultaneously.

The phrases created by other musicians can also be muted or played.
Muting or playing these phrases does not cause you to move between
rooms.

**Beta**

Phrases can be sequenced into sections which together complete a song.
They may play or not play at different parts of the song.  Playback
can be started or stopped at any point.

Song structure is shared between musicians.


**MVP**

Phrases can start before the first bar. (i.e. pickup notes or
anacrusis.)  They also do not need to extend the full duration of the
line.

Latency for an individual phrase can be adjusted after it has been
recorded.

#### The Dark Corner

The dark corner is a special studio where there is no room for other
musicians.  A musician using the microphone here can record music and
play tracks, but no one can listen in while they are playing.
  
#### Work Area

The Work Area displays a shared score, containing all musical phrases
created by all musicians.  Musical phrases are wide rectangular boxes
that stretch the width of the work area.  The content of the box
varies depending on what type of element it is. See [Musical
Phrases].

Typically a musical phrase is four bars, but this can be changed in the [Settings].

**Prototype**

The music you hear from another musician is only what they are
playing, not what they are recording

**Beta**

The music being played and recorded can both be heard using the delay
settings for the musician that is playing and recording.

**MVP**

Latency can be adjusted by the listener as well as the mix of recording and playback.

### Project Properties

**Prototype**

Project is hard-coded to 4/4 time, 120 BPM, key of C.  Four bars per
line.

**Beta**

Tempo and key signature can be set by URL parameters.  Still
restricted to 4/4 time only and four bars per line.

** MVP **

Tempo, key signature, time, bars per line can all be configured in project settings.

### Collaboration

The application runs in the browser on a single page.  Aside from a
PeerJS signaling server, there is no dependency on the cloud.
Instead, everything is hosted locally and all communication is handled
peer to peer.  Projects cannot be transfered to another musician.

** Prototype **

One musician (the project owner) must have the project open for others
to contriubute.  If the owner leaves the page or refreshes it, all
connections may be terminated without warning or even any feedback
indicating that the project is inaccessible. This may result in loss
of work.

** Beta **

One musician still hosts the project, but refreshing that page will
reestablish connection with other musicians, minimizing loss of work.

** MVP **

Project can be saved to the local file system or the cloud.  The file
format will be a bespoke format.  Individual audio lines can be
downloaded as WAV files, and they can also be drag-and-dropped
directly into a DAW like Ableton.

  
### Musical Phrases

A hierarchical structure defines the song.

**Phrases** are a single piece of audio or text lasting the line
  length of the project.  The default line length is four bars.

**Lines** are a collection of Phrases which play simultaneously.

A **Part** is a single source (e.g. an instrument).  It is the
concatenation of Phrases across lines.  Each part can only have one
Phrase per Line.

A **Section** is a sequence of lines.  E.g. a chorus or verse.

A **Song** is a collection of sections.
  
Every line is the same length in a project.  There are four types of lines:

  * Audio
  
  * Text

  * MIDI

  * Chords

Audio example: [ a wide bar showing traditional peaks corresponding to
the volume and transients in the audio signal ]

Text example: "It’s work. It's sweat. It’s drinking the grind"

MIDI example: [ Staff notation with a treble clef and notes making a simple melody ]

Chords example: Eb | Gm | Cm | Ab


A Line is a group of phrases which play simultaneously.  The
sequencing of these lines is determined by their order in the
work area.

Example:

```
Chords:  Eb | Gm | Cm | Ab
Text: "It’s work. It's sweat. It’s drinking the grind"
Audio: [ waveform of a vocal recording ]
Audio: [ waveform of a drum beat ]

Chords: [ a thin line indicating the repeat of the chords ]
Text: "It’s pain. It's frustration. It’s breaking my mind"
Audio: [ waveform of the second line of vocals ]
Audio: [ a thin line indicating the repeat of the previous drum beat ]
```

**Prototype**

Audio supports a single sample rate, monophonic sound.  The sample
rate is determined by the default audio context and cannot be changed.
The recording latency is fixed based on the record and playback
latencies in the audio context.  This cannot be adjusted in the
prototype.

Text can be captured via Speech to Text only, and it cannot be edited.

MIDI: Notes are recorded, quantized, reduced to monophonic, and
displayed in limited staff notation. Bass or treble clef only, no combined clefs.

Chords: Not supported.

** Beta **

MIDI: Midi can be played from the app. It always sends on MIDI channel
0.  This allows the application to be used as a MIDI sequencer.

  
** MVP **

MIDI suports multiple MIDI channels.  This allows the software to
control multiple external synthesizers simultaneously.


#### Audio Phrases

Audio phrases are the only ones which can be played back.  The other
types of phrases guide the musicians through the song.

**Prototype**

Each audio phrase can be muted individually.  A single playback button
will play the currently selected line.  Audio is played back in a
single audio channel

** Beta **

A simple mixer is associated with each part.  This allows for
adjusting levels and panning.

** MVP **
  
A simple filter for each part provides an optional low pass and high
pass filter (applied in series).  The cutoff can be adjusted and a
slope of either 12 or 24 dB per octave can be selected.
  

### Arrangement

Musical phrases are represented as rectangles that take up minimal
vertical space and horizontal space represents time.

**Prototype**

Phrases are added sequentially to the musician's workspace.

**Beta**

Audio is rendered in colors representing the spectral diversity and
fundamental frequency.

Text can be edited

Chords can be added as text.  Vertical bars in the text indicate
measure lines.


**MVP**

Chords: Multiple chords per bar divide the space equally and dashes
can be used to indicate a chord is extended over a period of time and
dots can be used to indicate that there is no chord at that time.
  
A future expansion may allow for chords in other formats like
drop-downs, note spelling, or notation.

 