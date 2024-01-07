sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
], function (Controller, JSONModel, Filter, FilterOperator, Sorter) {
    "use strict";

    const SORT_NONE = "";
    const SORT_ASC = "ASC";
    const SORT_DESC = "DESC";

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {

        onInit: function () {

            this._oView = this.getView();
            this._oView.addEventDelegate({
                onBeforeHide: function(oEvent) {
                    this._clearSearch();
                    this._clearAllSorting();
                    this._clearFilters();
                },
            }, this)

            const oRouter = this.getOwnerComponent().getRouter();
            const oCurrentRoute = oRouter.getHashChanger().getHash();
            const oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel("selectedIds").setProperty("/StoreID", oParameters.arguments.StoreID);

            const oSortModel = new JSONModel({
                Name: SORT_NONE,
                Price: SORT_NONE,
                Specs: SORT_NONE,
                SupplierInfo: SORT_NONE,
                MadeIn: SORT_NONE,
                ProductionCompanyName: SORT_NONE,
                Rating: SORT_NONE,
            });

            this.oSortModel = oSortModel;

            this.getView().setModel(oSortModel, "products");

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
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: "StoreId",
                        operator: FilterOperator.EQ,
                        value1: storeId
                    })
                ],
            });

            if (filterType !== "") {
                oFilter = new Filter({
                    filters: [
                        oFilter,
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
        },

        onProductSearch: function (oEvent) {
            const sSearchValue = oEvent.getParameter("query");
            this.performProductSearch(sSearchValue);
        },

        performProductSearch: function (sSearchValue) {
            const table = this.byId("ProductsTable");
            const oODataModel = this.getView().getModel("odata");
            oODataModel.metadataLoaded().then(() => {
                let oFilter = this.createFilters(sSearchValue);
                table.getBinding("items").filter(oFilter);
            });
        },

        createFilters: function (sSearchValue) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: "Name",
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: "Specs",
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: "SupplierInfo",
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: "MadeIn",
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: "ProductionCompanyName",
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                ],
                or: true,
            });

            if (+sSearchValue) {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        new Filter({
                            path: "Price",
                            operator: FilterOperator.EQ,
                            value1: +sSearchValue
                        }),
                        new Filter({
                            path: "Rating",
                            operator: FilterOperator.EQ,
                            value1: +sSearchValue
                        })
                    ],
                    or: true,
                })
            }
            return oFilter;
        },

        onSortButtonPress: function (oEvent) {
            const oSortButton = oEvent.getSource();
            const sSortBy = oSortButton.data("sortBy");
            let sSortType = this.oSortModel.getProperty(`/${sSortBy}`);

            this._clearAllSorting();

            const oProductsTable = this.byId("ProductsTable");
            const oItemsBinding = oProductsTable.getBinding("items");



            switch (sSortType) {
                case SORT_NONE: {
                    sSortType = SORT_ASC;
                    oSortButton.setIcon("sap-icon://sort-ascending");
                    break;
                }

                case SORT_ASC: {
                    sSortType = SORT_DESC;
                    oSortButton.setIcon("sap-icon://sort-descending");
                    break;
                }

                case SORT_DESC: {
                    sSortType = SORT_NONE;
                    oSortButton.setIcon("sap-icon://sort");
                    break;
                }
            }

            this.oSortModel.setProperty(`/${sSortBy}`, sSortType);

            if (sSortType === SORT_ASC || sSortType === SORT_DESC) {
                const bSortDesc = sSortType === SORT_DESC;
                const oSorter = new Sorter(sSortBy, bSortDesc);
                oSorter.fnCompare = this._compareFunction;
                oItemsBinding.sort(oSorter);
            }
        },

        _clearAllSorting: function (oEvent) {
            const oTable = this.byId("ProductsTable");
            oTable.getBinding("items").sort(null);

            const oColumns = oTable.getColumns();
            oColumns.forEach((column) => {
                if (column.getAggregation("header")) {
                    const oButton = column.getAggregation("header").getItems()[0];
                    oButton.setIcon("sap-icon://sort");
                }
            });

            const data = this.oSortModel.getData();

            for (const key in data) {
                this.oSortModel.setProperty(`/${key}`, SORT_NONE);
            }
        },

        _clearSearch: function () {
            const searchField = this.byId("ProductSearchField");
            searchField.setValue("");
        },

        _clearFilters: function () {
            const table = this.byId("ProductsTable");
            table.getBinding("items").filter(null);
        },

        _compareFunction: function(value1, value2) {

            if (typeof value1 == "string" && typeof value2 == "string") {
                return value1.localeCompare(value2);
            }

            value2 = parseFloat(value2);

            value1 = parseFloat(value1);

            if (value1 < value2) return -1;
            if (value1 === value2) return 0;
            if (value1 > value2) return 1;

        },
    });
});