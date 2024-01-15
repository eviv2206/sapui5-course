sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../Constants"
], function (Controller, JSONModel, DateFormat, Filter, FilterOperator, Constants) {
    "use strict";

    const VIEW_ID = {
        COMMENTS_LIST: "CommentsList",
    };

    return Controller.extend("yauheni.sapryn.controller.ProductDetails", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            const oCurrentRoute = oRouter.getHashChanger().getHash();
            const oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel(Constants.SELECTED_IDS_MODEL).setProperty("/StoreID", oParameters.arguments.StoreID);
            this.getOwnerComponent().getModel(Constants.SELECTED_IDS_MODEL).setProperty("/ProductID", oParameters.arguments.ProductID);

            oRouter.getRoute(Constants.PRODUCT_DETAILS_ROUTE).attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sProductID = mRouteArguments.ProductID;
            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);

            oODataModel.metadataLoaded().then(() => {
                const sProductPath = oODataModel.createKey(`/${Constants.PRODUCTS_URL_PATH}`, {id: sProductID});

                this.getView().bindObject({
                    path: sProductPath,
                    model: Constants.ODATA_MODEL,
                });

                const oFilter = new Filter("ProductId", FilterOperator.EQ, sProductID);

                const sCommentsPath = `/${Constants.PRODUCT_COMMENTS_URL_PATH}`;
                this.byId(VIEW_ID.COMMENTS_LIST).bindObject({
                    path: sCommentsPath,
                    model: Constants.ODATA_MODEL,
                });

                this.byId(VIEW_ID.COMMENTS_LIST).getBinding("items").filter(oFilter);

            })
        },

        formatStatus: function (sStatus) {
            switch (sStatus) {
                case Constants.STATUS_TYPE_OK:
                    return "Ok";
                case Constants.STATUS_TYPE_STORAGE:
                    return "Storage";
                case Constants.STATUS_TYPE_OUT_OF_STOCK:
                    return "Out of stock";
            }
        },

        formatState: function (sStatus) {
            switch (sStatus) {
                case Constants.STATUS_TYPE_OK:
                    return "Success";
                case Constants.STATUS_TYPE_STORAGE:
                    return "Indication03";
                case Constants.STATUS_TYPE_OUT_OF_STOCK:
                    return "Indication01";
            }
        },

        onLinkWithoutParamPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(oEvent.getSource().getProperty("target"));
        },

        onLinkStoreDetailsPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const sStoreId = this.getView().getModel(Constants.SELECTED_IDS_MODEL).getProperty("/StoreID");
            oRouter.navTo(Constants.STORE_DETAILS_ROUTE, {
                StoreID: sStoreId
            });
        },

        onLinkProductDetailsPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const sProductId = this.getView().getModel(Constants.SELECTED_IDS_MODEL).getProperty("/ProductID");
            oRouter.navTo(Constants.PRODUCT_DETAILS_ROUTE, {
                ProductID: sProductId
            });
        },
    });
});