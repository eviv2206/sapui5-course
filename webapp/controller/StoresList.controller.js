sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../Constants",
], function (Controller, Filter, FilterOperator, Constants) {
    "use strict";

    const VIEW_ID = {
        STORES_LIST_VIEW: "StoresList",
    };

    const STORE_PATH = {
        NAME: "Name",
        ADDRESS: "Address",
        FLOOR_AREA: "FloorArea",
    };

    return Controller.extend("yauheni.sapryn.controller.StoresList", {

        onSearch: function (oEvent) {
            const sSearchValue = oEvent.getParameter("query");
            this._performStoreSearch(sSearchValue);
        },

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

        _performStoreSearch: function (sSearchValue) {
            const oList = this.byId(VIEW_ID.STORES_LIST_VIEW);
            const oFilter = this._createFiltersForSearch(sSearchValue);
            oList.getBinding("items").filter(oFilter);
        },

        _createFiltersForSearch: function (sSearchValue) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: STORE_PATH.NAME,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                    new Filter({
                        path: STORE_PATH.ADDRESS,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                ],
                or: true
            });

            if (+sSearchValue) {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        new Filter({
                            path: STORE_PATH.FLOOR_AREA,
                            operator: FilterOperator.EQ,
                            value1: +sSearchValue
                        }),
                    ],
                    or: true,
                })
            }

            return oFilter;
        }
    });
});