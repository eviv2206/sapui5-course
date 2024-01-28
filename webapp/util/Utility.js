/**
 * Utility module for custom comparison functions.
 *
 */
sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Custom comparison function for sorting values.
         *
         * @param {any} value1 - The first value to compare.
         * @param {any} value2 - The second value to compare.
         * @returns {number} - Returns -1 if value1 is less than value2, 0 if they are equal, and 1 if value1 is greater than value2.
         */
        compareFunction: function (value1, value2) {

            if (typeof value1 == "string" && typeof value2 == "string") {
                return value1.localeCompare(value2);
            }

            value2 = parseFloat(value2);
            value1 = parseFloat(value1);

            if (value1 < value2) return -1;
            if (value1 === value2) return 0;
            if (value1 > value2) return 1;
        },
    }
})