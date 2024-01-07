sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoresOverview", {
        onStoreDetailsPress: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("StoreDetails");
        }
    });
});