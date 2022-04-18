/**
 * WorldHax
 * Game hacker for WorldBox: God Simulator
 * 
 * Converting pointers from CheatEngine Tables into
 * an executable that allows us to modify game memory, thus hacking it
 */

// TODO: Electron GUI
// TODO: Listen for keyup events even when not in focus

// TODO: Convert to 'Unit' Class
// over-enginering? Trace offset arrays using reduce

const { clone } = require('lodash');
const { to } = require('await-to-js');
const { memory } = require('jsmeow');
const { strToHex, hexToStr } = require('hexyjs');

const PROCESS_NAME = 'worldbox.exe';
const BASE_MODULE_NAME = 'mono-2.0-bdwgc.dll';
const BASE_MODULE_OFFSET = [0x004A86B8];

const SELECTED_UNIT_OFFSET = [...BASE_MODULE_OFFSET, 0x318, 0xFA0];
const SELECTED_UNIT_ATTRIBUTES_OFFSET = [...SELECTED_UNIT_OFFSET, 0xA0];
const SELECTED_UNIT_PROPERTIES_OFFSET = [...SELECTED_UNIT_OFFSET, 0x158];

const SELECTED_UNIT_HEALTH_OFFSET = [...SELECTED_UNIT_PROPERTIES_OFFSET, 0x14];
const SELECTED_UNIT_HUNGER_OFFSET = [...SELECTED_UNIT_PROPERTIES_OFFSET, 0x8c];




async function getBaseModuleAddress() {
    const { th32ProcessID } = memory.openProcess(PROCESS_NAME);
    const { modBaseAddr, modBaseSize } = memory.findModule(BASE_MODULE_NAME, th32ProcessID);

    console.log({modBaseAddr}, parseInt(modBaseAddr, 16))
    return modBaseAddr;
}

// NOT USED
function readBytesFromAddress(address, size = 4) {
    const bytes = memory.readBuffer(parseInt(Buffer.from(address), 16), size)
    console.log({address, bytes}, 'read bytes');
    return bytes;
}

// (address + offset).toString(16)

function jumpToPointer (address, offset, completed = false) {
    console.log(
        'jumping to pointer',
        '0x' + (address).toString(16),
        'offset',
        '0x' + (offset).toString(16),
        `dest address: ${'0x' + (address+offset).toString(16)}`,
        `completed: ${completed}`
    )
    // console.log('0x' + (address+offset).toString(16))
    const nextAddressString = (address+offset).toString(16);
    const nextAddress = parseInt(Buffer.from(nextAddressString), 16);

    console.log(nextAddress)

    console.log({nextAddress}, parseInt(nextAddress, 16), parseInt(offset, 16))
    // console.log(`jumping to ptr`, {address}, address.toString(16));
    return !completed
        ? memory.readMemory(nextAddress, 'pointer')
        : memory.readBuffer(nextAddress, 4);
}; 



// Traces offsets array to last element
// and gets the bytes
async function traceOffsets(offsetsArray) {
    return new Promise(async (resolve, reject) => {
        const [err, baseModuleAddress] = await to(getBaseModuleAddress());
        if (err) return reject(err);

        let offsets = clone(offsetsArray);
        let jmpAddress;

        // console.log(Buffer.from(readBytesFromAddress(baseModuleAddress)))

        // let readBytes = await readBytesFromAddress(jmpAddress, 8)
        // console.log('first read', readBytes, Buffer.from(readBytes))

        for (let i = 0; i < offsetsArray.length; i++) {
            let offset = offsets.shift();
            console.log(offsets.length);

            // console.log(readBytesFromAddress(jmpAddress, 8))

            if (!offset && !offsets.length) break;

            let isCompleted = !offsets.length;

            if (i === 0) {
                jmpAddress = jumpToPointer(baseModuleAddress, offset)
            }else {
                jmpAddress = jumpToPointer(jmpAddress, offset, isCompleted);
            }
        }

        // console.log({offsets, jmpAddress}, jmpAddress.toString(16));

        return readBytesFromAddress(jmpAddress);

    });
}


async function main() {

    console.log(SELECTED_UNIT_HEALTH_OFFSET)
    traceOffsets(SELECTED_UNIT_HUNGER_OFFSET);
}



main();

