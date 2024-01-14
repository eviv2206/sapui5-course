sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoresList", {

        onSearch: function (oEvent) {
            const sSearchValue = oEvent.getParameter("query");
            this._performStoreSearch(sSearchValue);
        },

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
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(oEvent.getSource().getProperty("target"));
        },

        _performStoreSearch: function (sSearchValue) {
            const oList = this.byId("StoresList");
            const oFilter = this._createFiltersForSearch(sSearchValue);
            oList.getBinding("items").filter(oFilter);
        },

        _createFiltersForSearch: function (sSearchValue) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: "Name",
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                    new Filter({
                        path: "Address",
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
                            path: "FloorArea",
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