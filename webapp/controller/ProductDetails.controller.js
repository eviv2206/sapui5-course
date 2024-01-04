sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.ProductDetails", {
        onStoreOverviewPress: function () {
            const router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("StoreOverview");
        },
    });
});