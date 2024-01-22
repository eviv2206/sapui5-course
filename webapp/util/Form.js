sap.ui.define([
    "sap/ui/core/Core",
], function (Core) {
    "use strict";
    return {
        resetFieldsError: function (aFields) {
            aFields.forEach((sField) => {
                const oControl = this.byId(sField);
                oControl.setValueState("None");
            });
        },

        registerFields: function (aFields) {
            const oMessageManager = Core.getMessageManager();

            aFields.forEach((sField) => {
                oMessageManager.registerObject(this.byId(sField), true);
            });

        },
    }
})