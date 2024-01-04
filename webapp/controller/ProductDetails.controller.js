sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, DateFormat) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.ProductDetails", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            var oCurrentRoute = oRouter.getHashChanger().getHash();
            var oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel("selectedIds").setProperty("/StoreID", oParameters.arguments.StoreID);
            this.getOwnerComponent().getModel("selectedIds").setProperty("/ProductID", oParameters.arguments.ProductID);

            oRouter.getRoute("ProductDetails").attachPatternMatched(this.onPatternMatched, this);

        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sProductID = mRouteArguments.ProductID;
            const oODataModel = this.getView().getModel("odata");

            oODataModel.metadataLoaded().then(() => {
                const JModel = new JSONModel();
                this.getView().setModel(JModel, "jdata");
                const sPath = "/Products(" + sProductID + ")";

                oODataModel.read(sPath, {
                    success: (data) => {
                        JModel.setProperty("/Product", data);
                    }
                });

                oODataModel.read("/ProductComments", {
                    urlParameters: {
                        "$filter": "ProductId eq " + sProductID
                    },

                    success: (data) => {
                        JModel.setProperty("/Comments", data.results);
                    }
                });

                this.getView().bindObject({
                    path: "/",
                    model: "jdata"
                });
            });
        },

        formatDate: function (date) {
            const oDateFormat = DateFormat.getDateInstance({
                pattern: "HH. MMM yyyy"
            });

            return oDateFormat.format(date);
        },

        onLinkWithoutParamPress: function (oEvent) {
            const router = this.getOwnerComponent().getRouter();
            router.navTo(oEvent.getSource().getProperty("target"));
        },

        onLinkStoreDetailsPress: function (oEvent) {
            const router = this.getOwnerComponent().getRouter();
            const storeId = this.getView().getModel("selectedIds").getProperty("/StoreID");
            router.navTo("StoreDetails", {
                StoreID: storeId
            });
        },

        onLinkProductDetailsPress: function (oEvent) {
            const router = this.getOwnerComponent().getRouter();
            const productId = this.getView().getModel("selectedIds").getProperty("/ProductID");
            router.navTo("ProductDetails", {
                ProductID: productId
            });
        },


    });
});