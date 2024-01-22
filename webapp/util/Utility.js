sap.ui.define([], function () {
    "use strict";

    return {
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