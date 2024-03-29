
/**
 * Custom SAPUI5 SimpleType for email validation.
 *
 * @class yauheni.sapryn.type.EmailType
 * @constructor
 * @public
 * @extends sap.ui.model.SimpleType
 */
sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException"
], function (SimpleType, ValidateException) {
    "use strict";

    return SimpleType.extend("yauheni.sapryn.type.EmailType", {
        /**
         * Parses the raw value to the desired JavaScript representation.
         *
         * @public
         * @param {any} oValue - The raw value to be parsed.
         * @returns {any} - The parsed value.
         */
        parseValue: function (oValue) {
            return oValue;
        },

        /**
         * Formats the JavaScript value to the raw value which can be used in the UI.
         *
         * @public
         * @param {any} oValue - The JavaScript value to be formatted.
         * @returns {any} - The formatted raw value.
         */
        formatValue: function (oValue) {
            return oValue;
        },

        /**
         * Validates the provided value according to email format.
         *
         * @public
         * @throws {sap.ui.model.ValidateException} Throws a ValidateException if the value is not a valid email.
         * @param {any} oValue - The value to be validated.
         */
        validateValue: function (oValue) {
            if (!oValue) {
                throw new ValidateException();
            }
            const rexMail = /^\w+[\w-+.]*@\w+([-.]\w+)*\.[a-zA-Z]{2,}$/;
            if (!oValue.match(rexMail)) {
                throw new ValidateException();
            }
        }
    })
})