/**
 * Utility module for form validation functions.
 *
 */
sap.ui.define([], function () {
    "use strict";

    /**
     * Checks the validity of a form with multiple fields.
     *
     * @param {string[]} aFields - An array of field IDs to be validated.
     * @returns {boolean} - Returns true if the form is valid, otherwise false.
     */
    function isValidForm(aFields) {
        let bValidationError = false;
        aFields.forEach((sField) => {
            const oControl = this.byId(sField);
            bValidationError = validateField(oControl) || bValidationError;
        });

        return !bValidationError;
    }

    /**
     * Validates a form field.
     *
     * @param {sap.ui.core.Control} oField - The UI control representing the form field.
     * @returns {boolean} - Returns true if the field is valid, otherwise false.
     */
    function validateField(oField) {
        let sValueState = "None";
        let bValidationError = false;
        const oBinding = oField.getBinding("value");

        try {
            oField instanceof sap.m.DatePicker ?
                validateDatePicker(oField) : validateValue(oBinding, oField.getValue(), oBinding.getType().getName());
        } catch (oException) {
            sValueState = "Error";
            bValidationError = true;
        }

        oField.setValueState(sValueState);

        return bValidationError;
    }

    /**
     * Validates a form field value based on its data type.
     *
     * @param {sap.ui.model.Binding} oBinding - The binding object of the form field.
     * @param {any} value - The value to be validated.
     * @param {string} sType - The data type of the field.
     * @throws {Error} Throws an error if the value is invalid.
     */
    function validateValue(oBinding, value, sType) {
        if (sType === "Integer" && !(!isNaN(parseInt(value)) && Number.isInteger(parseFloat(value)))) {
            throw new Error("Invalid integer");
        } else {
            oBinding.getType().validateValue(value);
        }
    }

    /**
     * Validates a sap.m.DatePicker control.
     *
     * @param {sap.m.DatePicker} oDatePicker - The DatePicker control to be validated.
     * @throws {Error} Throws an error if the date value is invalid.
     */
    function validateDatePicker(oDatePicker) {
        const oDateValue = oDatePicker.getDateValue();

        if (!oDateValue || !oDatePicker.isValidValue()) {
            throw new Error();
        }

    }

    return {
        isValidForm,
        validateField,
        validateValue,
    };
})