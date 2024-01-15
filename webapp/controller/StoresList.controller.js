sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../Constants"
], function (Controller, Constants) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoresList", {

        onListItemPress: function (oEvent) {
            const oSource = oEvent.getSource();

            const oCtx = oSource.getBindingContext(Constants.ODATA_MODEL);

            const oComponent = this.getOwnerComponent();

            const storeId = oCtx.getObject("id");

            oComponent.getRouter().navTo(Constants.STORE_DETAILS_ROUTE, {
                StoreID: storeId,
            });
        },

        onLinkWithoutParamPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(oEvent.getSource().getProperty("target"));
        },
    });
});