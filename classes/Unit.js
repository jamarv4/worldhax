const { set } = require("lodash");


const offsets = {
    processName: 'worldbox.exe',
    baseModuleName: 'mono-2.0-bdwgc.dll',
    baseModuleAddress: null, 
    baseModuleOffset: [0x004A86B8],
    attributesBaseOffset: [0xA0],
    propertiesBaseOffset: [0x158],
    selectedUnitOffset: [0x318, 0xFA0],
    offsets: {
        health: [0x14],
        hunger: [0x8c],
    },
}

function createProperty(key) {
    const property = {
        get [key]() {
           return this[key];
        },
        set () {
            console.log('set', arguments)
        }
    };
}

class Unit {
    constructor(offsetData) {
        this.processName = offsetData.processName;
        this.baseModuleName = offsetData.baseModuleName;
        this.baseModuleOffset = offsetData.baseModuleOffset;
        this.offsets = offsetData.offsets;
        
        this.initialize(offsetData);
    }


    createProperties() {
        const _this = this;
        const property = {
            health: 100
        };

        const propertyHandler = {
            get: function (target, property, receiver) {
                console.log('getter')
                return property;
            },
            set: function(target, p, receiver) {
                console.log('setter')
                property[target] = p;
            }
        };
        const proxy = new Proxy(property, propertyHandler);

        // this[]

        const createProxy = (key) => {
            console.log('creating proxy', key)
            const targetProperties = {
                [key]: null
            };
            const propertyHandler = {
                get: function (target, property, value) {
                    console.log('getter', property, value)
                    return value;
                },
                set: function(target, property, value) {
                    console.log('setter', property, value)
                    return true;
                }
            };

            return new Proxy(targetProperties, propertyHandler);

        };

        // console.dir({proxy}, proxy)

        Object.keys(this.offsets).forEach(key => {
            const proxy = createProxy(key);
            this[key] = proxy[key]

            // console.log(proxy, this, 'p')
        });

    }

    async initialize() {
        // get base module address
    
        Object.keys(this.offsets).forEach(offsetName => {
            Object.defineProperties(this, {
                [offsetName]: {
                    get: function() {
                        // read memory
                        console.log('dp getter', offsetName, arguments);
                        return true
                    },
                    set: function (value) {
                        // write to memory
                        console.log('dp setter', offsetName, value)
                        // this[offsetName] = value;
                        return true;
                    }
                }
            });

        })
    }


    getData(key) {
        console.log(key, this)
        return true;
    }

    setData(key, value) {

    }


}

const unit = new Unit(offsets);

// console.dir('testing getter', unit.health)
// console.log('testing setter', (unit.health = 100))

// const test = {
//     get() {
//         console.log('get')
//     },

//     set() {
//         console.log(arguments)
//     }
// }

// console.log(test = 4)


// console.log('health', unit.health, unit)
// console.log(unit.hunger)
console.log('unit health', unit.health)
console.log('unit hunger', unit.hunger)
unit.health = 1000;
unit.hunger = 100;
console.log(unit.health, unit.hunger)


module.exports = Unit;