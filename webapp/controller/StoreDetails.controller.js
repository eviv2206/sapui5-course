sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat"
], function (Controller, DateFormat) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            var oCurrentRoute = oRouter.getHashChanger().getHash();
            var oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel("selectedIds").setProperty("/StoreID", oParameters.arguments.StoreID);

            oRouter.getRoute("StoreDetails").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sStoreID = mRouteArguments.StoreID;
            const oODataModel = this.getView().getModel("odata");
            oODataModel.metadataLoaded().then(() => {
                const sKey = oODataModel.createKey("/Stores", {id: sStoreID});
                this.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });
            });
        },

        formatDate: function (vValue) {
            const oDateFormat = DateFormat.getDateInstance({
                pattern: "HH MMM yyyy"
            });

            return oDateFormat.format(vValue);
        },

        onLinkWithoutParamPress: function (oEvent) {
            const router = this.getOwnerComponent().getRouter();
            router.navTo(oEvent.getSource().getProperty("target"));
        },

        onLinkStoreDetailsPress: function (oEvent) {
            const router = this.getOwnerComponent().getRouter();
            const storeId = this.getView().getModel("selectedIds").getProperty("/StoreID");
            router.navTo(oEvent.getSource().getProperty("target"), {
                StoreID: storeId
            });
        },

        onTableItemPress: function (oEvent) {
            const oSource = oEvent.getSource();

            const oCtx = oSource.getBindingContext("odata");

            const oComponent = this.getOwnerComponent();

            const productId = oCtx.getObject("id");

            const storeId = this.getView().getModel("selectedIds").getProperty("/StoreID");

            oComponent.getRouter().navTo("ProductDetails", {
                StoreID: storeId,
                ProductID: productId,
            });
        }

    });
});