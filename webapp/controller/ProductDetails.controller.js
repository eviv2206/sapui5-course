sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, DateFormat, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.ProductDetails", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            const oCurrentRoute = oRouter.getHashChanger().getHash();
            const oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel("selectedIds").setProperty("/StoreID", oParameters.arguments.StoreID);
            this.getOwnerComponent().getModel("selectedIds").setProperty("/ProductID", oParameters.arguments.ProductID);

            oRouter.getRoute("ProductDetails").attachPatternMatched(this.onPatternMatched, this);

        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sProductID = mRouteArguments.ProductID;
            const oODataModel = this.getView().getModel("odata");

            oODataModel.metadataLoaded().then(() => {
                const sProductPath = oODataModel.createKey("/Products", {id: sProductID});

                this.getView().bindObject({
                    path: sProductPath,
                    model: "odata"
                });

                const oFilter = new Filter("ProductId", FilterOperator.EQ, sProductID);

                const sCommentsPath = "/ProductComments";
                this.byId("CommentsList").bindObject({
                    path: sCommentsPath,
                    model: "odata",
                });

                this.byId("CommentsList").getBinding("items").filter(oFilter);

            })
        },

        formatStatus: function (sStatus) {
            switch (sStatus) {
                case "OK":
                    return "Ok";
                case "STORAGE":
                    return "Storage";
                case "OUT_OF_STOCK":
                    return "Out of stock";
            }
        },

        formatState: function (sStatus) {
            switch (sStatus) {
                case "OK":
                    return "Success";
                case "STORAGE":
                    return "Indication03";
                case "OUT_OF_STOCK":
                    return "Indication01";
            }
        },

        onLinkWithoutParamPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(oEvent.getSource().getProperty("target"));
        },

        onLinkStoreDetailsPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const sStoreId = this.getView().getModel("selectedIds").getProperty("/StoreID");
            oRouter.navTo("StoreDetails", {
                StoreID: sStoreId
            });
        },

        onLinkProductDetailsPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const sProductId = this.getView().getModel("selectedIds").getProperty("/ProductID");
            oRouter.navTo("ProductDetails", {
                ProductID: sProductId
            });
        },


    });
});