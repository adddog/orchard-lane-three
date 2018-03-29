
import * as ActionTypes from "../constants/actionTypes";

export const setInitialConfig = (configuration) => ({
    configuration,
    type: ActionTypes.SET_INITIAL_CONFIG,
});

export const updateConfig = (configuration) => ({
    configuration,
    type: ActionTypes.UPDATE_CONFIG,
});

