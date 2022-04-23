const {memory} = require('jsmeow');
const {clone, concat} = require('lodash');
const config = require('../offsets');

function jumpToAddress (address, offset, completed = false) {
    const nextAddressString = (address+offset).toString(16);
    const nextAddress = parseInt(Buffer.from(nextAddressString), 16);

    return !completed
        ? memory.readMemory(nextAddress, 'pointer')
        : memory.readBuffer(nextAddress, 8);
}; 


// Traces offsets array to last element
// returns address to read/write
function traceOffsets(offsetsArray) {
    {
        const { th32ProcessID } = memory.openProcess(config.processName);
        const { modBaseAddr } = memory.findModule(config.baseModuleName, th32ProcessID);

        let jumpAddress;
        let offsets = clone(offsetsArray);
        let result = {
            decimalAddress: null,
            address: null,
            bytes: []
        };

        for (let i = 0; i < offsetsArray.length; i++) {
            let offset = offsets.shift();
            let isCompleted = !offsets.length;

            if (!offset && !offsets.length) break;

            if (i === 0)  {
                jumpAddress = jumpToAddress(modBaseAddr, offset, isCompleted);
            } else {
                if (isCompleted) {
                    result.decimalAddress = jumpAddress + offset;
                    result.address =('0x' + (jumpAddress).toString(16));
                }

                jumpAddress = jumpToAddress(jumpAddress, offset, isCompleted);
                result.bytes = jumpAddress;
            }
        }

        return result;
    }
}


class Unit {
    constructor(config) {
        this.processName = config.processName;
        this.baseModuleName = config.baseModuleName;
        this.baseModuleOffset = config.baseModuleOffset;
        this.items = config.items;
        this.attributesBaseOffset = [0xA0];
        this.propertiesBaseOffset =[0x158];
        this.selectedUnitOffset = [0x318, 0xFA0];
        
        this.initialize();
    }

    addItem (item) {
        let itemOffset = null;

        if (item.type === 'properties') {
            itemOffset = this.propertiesBaseOffset;
        } else {
            itemOffset = this.attributesBaseOffset;
        }

        const offsets = concat(
            this.baseModuleOffset,
            this.selectedUnitOffset,
            itemOffset,
            item.offset[0]
        );

        

        return offsets;
    }

    initialize() {    
        Object.keys(this.items).forEach(itemName => {
            Object.defineProperties(this, {
                [itemName]: {
                    get: function() {
                        const offset = this.addItem(this.items[itemName]);
                        const destination = traceOffsets(offset);
                       
                        return destination.bytes[0];
                    },
                    set: function (value) {
                        const offset = this.addItem(this.items[itemName]);
                        const destination = traceOffsets(offset);

                        memory.writeBuffer(
                            destination.decimalAddress,
                            Buffer.from([Number(value).toString()])
                        )

                        return true;
                    }
                }
            });

        });
    }
}

module.exports = Unit;
