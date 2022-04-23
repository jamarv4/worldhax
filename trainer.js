
// write to screen "hack enabled" when enabled

// listen for key events and print updates on screen.
// key events will gather user input to use in the game

// Enable/Disable hotkey for trainer <TAB>

const offsets = require('./offsets');
const Screen = require('./classes/Screen')
const Unit = require('./classes/Unit');

const screen = new Screen();

// screen.write('hello world');