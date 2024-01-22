sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException"
], function (SimpleType, ValidateException) {
    "use strict";

    const MESSAGES = {
        NOT_VALID_EMAIL: "'$str' is not a valid email address",
        EMAIL_REQUIRED: "Email is required",
    }
    return SimpleType.extend("yauheni.sapryn.type.EmailType", {
        parseValue: function (oValue) {
            return oValue;
        },
        formatValue: function (oValue) {
            return oValue;
        },
        validateValue: function (oValue) {
            if (!oValue) {
                throw new ValidateException(MESSAGES.EMAIL_REQUIRED);
            }
            const rexMail = /^\w+[\w-+.]*@\w+([-.]\w+)*\.[a-zA-Z]{2,}$/;
            if (!oValue.match(rexMail)) {
                throw new ValidateException(MESSAGES.NOT_VALID_EMAIL.replace("$str", oValue));
            }
        }
    })
})