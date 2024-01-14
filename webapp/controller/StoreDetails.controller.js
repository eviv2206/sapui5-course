sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            const oCurrentRoute = oRouter.getHashChanger().getHash();
            const oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel("selectedIds").setProperty("/StoreID", oParameters.arguments.StoreID);

            oRouter.getRoute("StoreDetails").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sStoreID = mRouteArguments.StoreID;
            const oODataModel = this.getView().getModel("odata");
            oODataModel.metadataLoaded().then(() => {

                const sPath = oODataModel.createKey("/Stores", {id: sStoreID});
                this.getView().bindObject({
                    path: sPath,
                    model: "odata"
                });

                this._getProductsFilterCount(sStoreID, "", oODataModel, (length) => {
                    this.byId("FilterAll").setCount(length);
                });

                this._getProductsFilterCount(sStoreID, "OK", oODataModel, (length) => {
                    this.byId("FilterOk").setCount(length);
                })

                this._getProductsFilterCount(sStoreID, "STORAGE", oODataModel, (length) => {
                    this.byId("FilterStorage").setCount(length);
                });

                this._getProductsFilterCount(sStoreID, "OUT_OF_STOCK", oODataModel, (length) => {
                    this.byId("FilterOutOfStock").setCount(length);
                })

            });
        },

        _getProductsFilterCount: function (nStoreId, sFilterType, oODataModel, fOnSuccess) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: "StoreId",
                        operator: FilterOperator.EQ,
                        value1: nStoreId
                    })
                ],
            });

            if (sFilterType !== "") {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        new Filter({
                            path: "Status",
                            operator: FilterOperator.EQ,
                            value1: sFilterType,
                        }),
                    ],
                    and: true
                });
            }


            oODataModel.read("/Products/$count", {
                filters: [oFilter],
                success: function (data) {
                    fOnSuccess(data);
                },
            });
        },

        onLinkWithoutParamPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(oEvent.getSource().getProperty("target"));
        },

        onLinkStoreDetailsPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const sStoreId = this.getView().getModel("selectedIds").getProperty("/StoreID");
            oRouter.navTo(oEvent.getSource().getProperty("target"), {
                StoreID: sStoreId
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