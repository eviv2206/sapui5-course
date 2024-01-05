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

                this.getProductsFilterCount(sStoreID, "", oODataModel, (length) => {
                    this.byId("FilterAll").setCount(length);
                });

                this.getProductsFilterCount(sStoreID, "OK", oODataModel, (length) => {
                    this.byId("FilterOk").setCount(length);
                })

                this.getProductsFilterCount(sStoreID, "STORAGE", oODataModel, (length) => {
                    this.byId("FilterStorage").setCount(length);
                });

                this.getProductsFilterCount(sStoreID, "OUT_OF_STOCK", oODataModel, (length) => {
                    this.byId("FilterOutOfStock").setCount(length);
                })

            });
        },

        getProductsFilterCount: function (storeId, filterType, odataModel, onSuccess) {
            let oFilter;

            if (filterType === "") {
                oFilter = new Filter({
                    filters: [
                        new Filter({
                            path: "StoreId",
                            operator: FilterOperator.EQ,
                            value1: storeId
                        })
                    ],
                });

            } else {
                oFilter = new Filter({
                    filters: [
                        new Filter({
                            path: "StoreId",
                            operator: FilterOperator.EQ,
                            value1: storeId
                        }),

                        new Filter({
                            path: "Status",
                            operator: FilterOperator.EQ,
                            value1: filterType,
                        }),
                    ],
                    and: true
                });
            }

            odataModel.read("/Products", {
                filters: [oFilter],
                success: function (data) {
                    onSuccess(data.results.length);
                },
            });
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