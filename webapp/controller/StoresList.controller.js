sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.StoresList", {

        onSearch: function (oEvent) {
            const sSearchValue = oEvent.getParameter("query");
            this.performStoreSearch(sSearchValue);
        },

        performStoreSearch: function (sSearchValue) {
            const oList = this.byId("StoresList");
            const oODataModel = this.getView().getModel("odata");
            oODataModel.metadataLoaded().then(() => {
                let oFilter = new Filter({
                    filters: [
                        new Filter({
                            path: "Name",
                            operator: FilterOperator.Contains,
                            value1: sSearchValue,
                            caseSensitive: false,
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

                oList.getBinding("items").filter(oFilter);
            })
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
    });
});