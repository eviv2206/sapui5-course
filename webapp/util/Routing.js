/**
 * Utility module for handling navigation links.
 *
 */
sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Navigates to a route without parameters.
         *
         * @param {string} sPath - The path of the route to navigate to.
         */
        onLinkWithoutParamPress: function (sPath) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(sPath);
        },

        /**
         * Navigates to a route with parameters.
         *
         * @param {string} sPath - The path of the route to navigate to.
         * @param {Object} oParams - The parameters to pass during navigation.
         */
        onLinkWithParamsPress: function (sPath, oParams) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(sPath, oParams);
        },
    }
})