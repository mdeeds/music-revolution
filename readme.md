# Zatt's Musical Exchange

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
all discovered MIDI inputs.

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

Clicking on this box adds your name to the huddle.  Your voice audio
source will be sent to all others in the huddle room in near real time.

The huddle room box it titled, "Huddle" and the names of all musicians
in the huddle room are inside the box.

#### Work Area

The Work Area is divided into "Studios" for each musician.  Your name
indicates "where" you are at any time.  You will see it in the huddle
room, or at the top of another musician's studio.  Your studio always
has your name on it, and it will be greyed out when you are not there.
It will be bold when you are in your own studio.

Each studio has the musical lines created by the musician that owns
that studio. You can only create music in your own studio.  All
musical lines are wide rectangular boxes that stretch the width of the
studio.  The content of the box varies depending on what type of
element it is. See [Musical Lines].

##### Other's Studios
  
Clicking on another musician's studio allows you to hear the music
they are playing.  Your voice stream will be sent to them in near real
time, and you will hear their voice stream in near real time.

**Prototype**

The music you hear from another musician is only what they are
playing, not what they are recording

**Beta**

The music being played and recorded can both be heard using the delay
settings for the musician that is playing and recording.

**MVP**

Latency can be adjusted by the listener as well as the mix of recording and playback.

##### Your Studio

In your studio, you can create new [Musical Lines].

**Prototype**

Lines are created in-order and cannot be rearanged.  They can be
muted, but there is no sequencing.  All lines play simultaneously.

The lines created by other musicians can also be muted or played.
Muting or playing these lines does not cause you to enter the [Other's Studios].

**Beta**

Lines can be sequenced into a song structure.  They may play or not
play at different parts of the song.  Playback can be started or
stopped at any point.

Song structure is shared between musicians.


**MVP**

Lines can start before the first bar. (i.e. pickup notes or
anacrusis.)  They also do not need to extend the full duration of the
line.

Latency for an individual line can be adjusted after it has been
recorded.
    

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

  
### Musical Lines

Every line is the same length in a project.  There are four types of lines:

  * Audio
  
  * Text

  * MIDI

  * Chords

Audio example: [ a wide bar showing traditional peaks corresponding to the volume and transients in the audio signal ]

Text example: "It’s work. It's sweat. It’s drinking the grind"

MIDI example: [ Staff notation with a treble clef and notes making a simple melody ]

Chords example: Eb | Gm | Cm | Ab  

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

### Arrangement

Musical lines are represented as rectangles that take up minimal
vertical space and horizontal space represents time.

**Prototype**

Lines are added sequentially to the musician's workspace.

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

 