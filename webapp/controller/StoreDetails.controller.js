sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {
        onStoreOverviewPress: function () {
            var router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("StoreOverview");
        },

        onProductDetailsPress: function () {
            var router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("ProductDetails");
        }
    });
});