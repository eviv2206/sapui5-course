sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../Constants"
], function (Controller, Filter, FilterOperator, Constants) {
    "use strict";

    const FILTER_PATH = {
        STATUS: "Status",
        STORE_ID: "StoreId",
    };

    const VIEW_ID = {
        FILTER_ALL: "FilterAll",
        FILTER_OK: "FilterOk",
        FILTER_STORAGE: "FilterStorage",
        FILTER_OUT_OF_STOCK: "FilterOutOfStock",
    };

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute(Constants.STORE_DETAILS_ROUTE).attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");

            const sStoreID = mRouteArguments.StoreID;
            this.getOwnerComponent().getModel(Constants.SELECTED_IDS_MODEL).setProperty("/StoreID", sStoreID);

            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);
            oODataModel.metadataLoaded().then(() => {
                const sPath = oODataModel.createKey(`/${Constants.STORES_URL_PATH}`, {id: sStoreID});
                this.getView().bindObject({
                    path: sPath,
                    model: Constants.ODATA_MODEL
                });

                this._setAllProductsFilterCount(oODataModel, sStoreID);

            });
        },

        _setAllProductsFilterCount: function (oODataModel, sStoreID) {
            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_ALL, oODataModel, (length) => {
                this.byId(VIEW_ID.FILTER_ALL).setCount(length);
            });

            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_OK, oODataModel, (length) => {
                this.byId(VIEW_ID.FILTER_OK).setCount(length);
            })

            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_STORAGE, oODataModel, (length) => {
                this.byId(VIEW_ID.FILTER_STORAGE).setCount(length);
            });

            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_OUT_OF_STOCK, oODataModel, (length) => {
                this.byId(VIEW_ID.FILTER_OUT_OF_STOCK).setCount(length);
            })
        },

        _getProductsFilterCount: function (nStoreId, sFilterType, oODataModel, fOnSuccess) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: FILTER_PATH.STORE_ID,
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
                            path: FILTER_PATH.STATUS,
                            operator: FilterOperator.EQ,
                            value1: sFilterType,
                        }),
                    ],
                    and: true
                });
            }


            oODataModel.read(`/${Constants.PRODUCTS_URL_PATH}/$count`, {
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
            const sStoreId = this.getView().getModel(Constants.SELECTED_IDS_MODEL).getProperty("/StoreID");
            oRouter.navTo(oEvent.getSource().getProperty("target"), {
                StoreID: sStoreId
            });
        },

        onTableItemPress: function (oEvent) {
            const oSource = oEvent.getSource();

            const oCtx = oSource.getBindingContext(Constants.ODATA_MODEL);

            const oComponent = this.getOwnerComponent();

            const productId = oCtx.getObject("id");

            const storeId = this.getView().getModel(Constants.SELECTED_IDS_MODEL).getProperty("/StoreID");

            oComponent.getRouter().navTo(Constants.PRODUCT_DETAILS_ROUTE, {
                StoreID: storeId,
                ProductID: productId,
            });
        }
    });
});