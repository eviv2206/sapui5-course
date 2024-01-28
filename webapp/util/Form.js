/**
 * Utility module for handling form fields and messaging.
 *
 */
sap.ui.define([
    "sap/ui/core/Messaging",
], function (Messaging) {
    "use strict";
    return {

        /**
         * Resets the error state of specified fields in a form.
         *
         * @param {string[]} aFields - An array of field IDs to reset the error state.
         */
        resetFieldsError: function (aFields) {
            aFields.forEach((sField) => {
                const oControl = this.byId(sField);
                oControl.setValueState("None");
            });
        },

        /**
         * Registers form fields for messaging to enable control validations.
         *
         * @param {string[]} aFields - An array of field IDs to register for messaging.
         */
        registerFields: function (aFields) {
            aFields.forEach((sField) => {
                Messaging.registerObject(this.byId(sField), true);
            });
        },
    }
})