import { createDefaultThemes, createDefaultSMData, createDefaultPorters } from './defaults.js';

// Single shared state object (importers can mutate properties, not rebind)
export const state = {
    currentProjectId: null,
    entitiesData: [],
    spaceData: [],
    appThemes: createDefaultThemes(),
    smData: createDefaultSMData(),
    portersData: createDefaultPorters()
};
