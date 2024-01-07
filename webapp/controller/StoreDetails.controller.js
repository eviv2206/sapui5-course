sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {
        onStoreOverviewPress: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("StoreOverview");
        },

        onProductDetailsPress: function () {
            const router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("ProductDetails");
        }
    });
});