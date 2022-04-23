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
        },
    },
}


module.exports = offsetConfig;