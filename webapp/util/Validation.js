sap.ui.define([], function () {
    "use strict";

    function isValidForm(fields) {
        let bValidationError = false;
        fields.forEach((field) => {
            const oControl = this.byId(field);
            if (oControl instanceof sap.m.DatePicker) {
                bValidationError = validateDatePicker(oControl) || bValidationError;
            } else {
                bValidationError = validateInput(oControl) || bValidationError;
            }
        });

        return !bValidationError;
    }

    function validateInput(oInput) {
        let sValueState = "None";
        let bValidationError = false;
        const oBinding = oInput.getBinding("value");

        try {
            validateValue(oBinding, oInput.getValue(), oBinding.getType().getName());
        } catch (oException) {
            sValueState = "Error";
            bValidationError = true;
        }

        oInput.setValueState(sValueState);

        return bValidationError;
    }

    function validateValue(oBinding, value, sType) {
        if (sType === "Integer" && !(!isNaN(parseInt(value)) && Number.isInteger(parseFloat(value)))) {
            throw new Error("Invalid integer");
        } else {
            oBinding.getType().validateValue(value);
        }
    }

    function validateDatePicker(oDatePicker) {
        let sValueState = "None";
        let bValidationError = false;

        try {
            const oDateValue = oDatePicker.getDateValue();

            if (!oDateValue || oDateValue > new Date()) {
                throw new Error("Invalid date");
            }
        } catch (oException) {
            sValueState = "Error";
            bValidationError = true;
        }

        oDatePicker.setValueState(sValueState);

        return bValidationError;
    }

    return {
        isValidForm,
        validateInput,
        validateValue,
        validateDatePicker
    };
})