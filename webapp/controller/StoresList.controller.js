sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoresList", {

        onListItemPress: function (oEvent) {
            const oSource = oEvent.getSource();

            const oCtx = oSource.getBindingContext("odata");

            const oComponent = this.getOwnerComponent();

            const storeId = oCtx.getObject("id");

            oComponent.getRouter().navTo("StoreDetails", {
                StoreID: storeId,
            });
        },

        onLinkWithoutParamPress: function (oEvent) {
            const router = this.getOwnerComponent().getRouter();
            router.navTo(oEvent.getSource().getProperty("target"));
        },
    });
});