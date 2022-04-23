/**
 * Screen class for in-game 'console'
 */

const {draws,overlay,colors,isKeyPressed,waitsLoop} = require('jsmeow');
const {throttle} = require('lodash');
const { center } = overlay.init('WorldBox', false, 0x23);
const font = overlay.fontInit(15, 'Arial'); 
const consoleFont = overlay.fontInit(10, 'Arial');
const Unit = require('./Unit');
const config = require('../offsets');
const menu = Object.keys(config.items);
const unit = new Unit(config);

let input = [];
let isSelecting = false;
let menuIndex = 0;
let updateKeyTimerThreshold = 0;
let updateSelectionTimerThreshold = 0;

function updateMenuIndex(reverse) {
    const time = new Date().getTime();
    const newThreshold = time + (300);

    if (time < updateKeyTimerThreshold) return;

    updateKeyTimerThreshold = newThreshold;

    if (menuIndex >= menu.length -1 || menuIndex < 0) {
        menuIndex = 0;
    }

    if (reverse && (menuIndex - 1) <= 0) {
        menuIndex = (menu.length - 1);
    }

    return reverse ? ( menuIndex--) : (menuIndex++);
}

function printSelection() {
    const amount = parseInt(input.join(''));

    return `amount: ${amount || '###'}`;
}

function applyAmount(amount, attr) {

    let amountToApply = (amount > 255 ? 255 : amount);    
    if (isNaN(amount)) return;

    unit[attr] = amountToApply;
    input = [];

    isSelecting = false;
}

function getSelectionPrompt() {
    const time = new Date().getTime() + (300);

    updateSelectionTimerThreshold = (new Date().getTime()) + 100;

    if (time < updateSelectionTimerThreshold || !isSelecting) return '';

        return `${printSelection()}`;
    }

function writeToScreen() {
    draws.text(font, center.x * 1.65, center.y * 1.9, 'Worldhax Enabled', colors.green);
    draws.text(consoleFont, center.x * 1.65, center.y * 1.80, `${menu[menuIndex]}: ${unit[menu[menuIndex]]}`, colors.green);
    draws.text(consoleFont, center.x * 1.65, center.y * 1.74, `${getSelectionPrompt()}`, colors.green);
}

function select() {

    isSelecting = !isSelecting;
    if (!isSelecting) {
        applyAmount(
            parseInt(input.join('')),
            menu[menuIndex]
        );
    }

}

// class Screen {
//     constructor() {}
// }

// module.exports = Screen;


// const { center } = overlay.init('WorldBox', false, 0x23);
// const font = overlay.fontInit(12, 'Impact');

function checkInput() {
    // backspace key 48-57
    if (!isSelecting) return;
    if (isKeyPressed(8)) input.pop();
    if (isKeyPressed(48)) input.push(0);
    if (isKeyPressed(49)) input.push(1);
    if (isKeyPressed(50)) input.push(2);
    if (isKeyPressed(51)) input.push(3);
    if (isKeyPressed(52)) input.push(4);
    if (isKeyPressed(53)) input.push(5);
    if (isKeyPressed(54)) input.push(6);
    if (isKeyPressed(55)) input.push(7);
    if (isKeyPressed(56)) input.push(8);
    if (isKeyPressed(57)) input.push(9);
}

function tick() {
    const throttleSelect = throttle(select, 500);
    const throttleCheckInput = throttle(checkInput, 100);

    while (overlay.loop(true)) {

        if (isKeyPressed(38)) updateMenuIndex();
        if (isKeyPressed(40)) updateMenuIndex(true);
        if (isKeyPressed(13)) throttleSelect();

        throttleCheckInput();
        writeToScreen();
    }
}

tick();
