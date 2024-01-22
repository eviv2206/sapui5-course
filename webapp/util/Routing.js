sap.ui.define([], function () {
    "use strict";

    return {
        onLinkWithoutParamPress: function (path) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(path);
        },

        onLinkWithParamsPress: function (path, params) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(path, params);
        },
    }
})