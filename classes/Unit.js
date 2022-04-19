const {memory} = require('jsmeow');
const {clone, concat} = require('lodash');

const offsetConfig = {
    processName: 'worldbox.exe',
    baseModuleName: 'mono-2.0-bdwgc.dll',
    baseModuleOffset: 0x004A86B8,
    attributesBaseOffset: [0xA0],
    propertiesBaseOffset: [0x158],
    selectedUnitOffset: [0x318, 0xFA0],
    items: {
        health: {
            offset: [0x14],
            type: 'properties',
        },
        hunger: {
            offset: [0x8c],
            type: 'properties',
        },
        kills: {
            offset: [0x7c],
            type: 'properties',
        },
        level: {
            offset: [0x90],
            type: 'properties',
        },
        experience: {
            offset: [0x94],
            type: 'properties',
        },
        age: {
            offset: [0x80],
            type: 'properties',
        },
        maxHealth: {
            offset: [0x4c],
            type: 'attributes',
        },
        armor: {
            offset: [0x50],
            type: 'attributes',
        },
        criticalHit: {
            offset: [0x64],
            type: 'attributes',
        },
        attackSpeed: {
            offset: [0x78],
            type: 'attributes',
        },
        damage: {
            offset: [0x44],
            type: 'attributes',
        },
        intelligence: {
            offset: [0x2c],
            type: 'attributes',
        },
        stewardship: {
            offset: [0x28],
            type: 'attributes',
        },
        diplomacy: {
            offset: [0x20],
            type: 'attributes',
        },
        warfare: {
            offset: [0x24],
            type: 'attributes',
        },
        speed: {
            offset: [0x48],
            type: 'attributes',
        }
    },
}


function jumpToAddress (address, offset, completed = false) {
    const nextAddressString = (address+offset).toString(16);
    const nextAddress = parseInt(Buffer.from(nextAddressString), 16);

    return !completed
        ? memory.readMemory(nextAddress, 'pointer')
        : memory.readBuffer(nextAddress, 8);
}; 

function getBaseModuleAddress() {
    const { th32ProcessID } = memory.openProcess(offsetConfig.processName);
    const { modBaseAddr } = memory.findModule(offsetConfig.baseModuleName, th32ProcessID);

    return modBaseAddr;
}

// Traces offsets array to last element
// returns address to read/write
function traceOffsets(offsetsArray) {
    {
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
                jumpAddress = jumpToAddress(getBaseModuleAddress(), offset, isCompleted);
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
    constructor(offsetConfig) {
        this.processName = offsetConfig.processName;
        this.baseModuleName = offsetConfig.baseModuleName;
        this.baseModuleOffset = offsetConfig.baseModuleOffset;
        this.items = offsetConfig.items;
        this.attributesBaseOffset = [0xA0];
        this.propertiesBaseOffset =[0x158];
        this.selectedUnitOffset = [0x318, 0xFA0];
        
        this.initialize(offsetConfig);
    }

    createOffsets (item) {
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
                        const offset = this.createOffsets(this.items[itemName]);
                        const destination = traceOffsets(offset);
                       
                        return destination.bytes[0];
                    },
                    set: function (value) {
                        const offset = this.createOffsets(this.items[itemName]);
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

const unit = new Unit(offsetConfig);


unit.hunger = 100;
console.log(
    unit.maxHealth
)



module.exports = Unit;
