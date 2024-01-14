sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox, MessageToast) {
    "use strict";

    const SORT_NONE = "";
    const SORT_ASC = "ASC";
    const SORT_DESC = "DESC";

    const FILTER_ALL_ITEM = "FilterAll";

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {

        onInit: function () {
            this.getView().addEventDelegate({onBeforeHide: this.onBeforeHide}, this)

            const oRouter = this.getOwnerComponent().getRouter();
            const oCurrentRoute = oRouter.getHashChanger().getHash();
            const oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel("selectedIds").setProperty("/StoreID", oParameters.arguments.StoreID);

            this.oSortModel = new JSONModel({
                Name: SORT_NONE,
                Price: SORT_NONE,
                Specs: SORT_NONE,
                SupplierInfo: SORT_NONE,
                MadeIn: SORT_NONE,
                ProductionCompanyName: SORT_NONE,
                Rating: SORT_NONE,
            });

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

                const sSearchValue = this.byId("ProductSearchField").getValue();

                this._updateAllFilters(oODataModel, sStoreID, sSearchValue);
            });
        },

        onBeforeHide: function (oEvent) {
            this._clearSearch();
            this._clearAllSorting();
            this._clearFilters();
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
        },

        onProductSearch: function (oEvent) {
            const sSearchValue = oEvent.getParameter("query");
            this._performProductSearch(sSearchValue);
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

        onFilterSelect: function (oEvent) {
            const oBinding = this.byId("ProductsTable").getBinding("items");
            const sKey = oEvent.getParameter("key");
            const sSearchValue = this.byId("ProductSearchField").getValue();

            const oFilters = this._createFilterStatusWithSearch(sKey, sSearchValue);

            oBinding.filter(oFilters);
        },

        onDeleteProductButtonPress: function (oEvent) {
            this._showMessageBox(
                "Confirmation",
                "Are you sure you want to delete this product?",
                () => this._handleDeleteProduct(oEvent),
            );
        },

        onCreateProductButtonPress: function (oEvent) {
            const oView = this.getView();
            const oODataModel = oView.getModel("odata");
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "yauheni.sapryn.view.fragments.ProductDialog", this);
                oView.addDependent(this.oDialog);
            }

            const oEntryCtx = oODataModel.createEntry("/Products");

            this.oDialog.setBindingContext(oEntryCtx);

            this.oDialog.setModel(oODataModel);

            this.oDialog.open();

        },

        onDeleteStoreButtonPress: function (oEvent) {
            this._showMessageBox(
                "Confirmation",
                "Are you sure you want to delete this store?",
                () => this._handleDeleteStore(oEvent, this),
            );
        },

        _updateAllFilters: function (oODataModel, sStoreID, sSearchValue) {
            this._getProductsFilterCount(sStoreID, "", oODataModel, sSearchValue, (length) => {
                this.byId("FilterAll").setCount(length);
            });

            this._getProductsFilterCount(sStoreID, "OK", oODataModel, sSearchValue, (length) => {
                this.byId("FilterOk").setCount(length);
            })

            this._getProductsFilterCount(sStoreID, "STORAGE", oODataModel, sSearchValue, (length) => {
                this.byId("FilterStorage").setCount(length);
            });

            this._getProductsFilterCount(sStoreID, "OUT_OF_STOCK", oODataModel, sSearchValue, (length) => {
                this.byId("FilterOutOfStock").setCount(length);
            })
        },

        _showMessageBox: function (title, message, onConfirm) {
            MessageBox.confirm(
                message,
                {
                    title: title,
                    onClose: (oAction) => {
                        if (oAction === MessageBox.Action.OK) {
                            onConfirm();
                        }
                    }
                }
            );
        },

        _handleDeleteStore: function (oEvent, those) {
            const oRouter = those.getOwnerComponent().getRouter();

            const oCtx = oEvent.getSource().getBindingContext("odata");

            const oODataModel = oCtx.getModel("odata");

            const sPath = oODataModel.createKey("/Stores", oCtx.getObject());

            oODataModel.remove(sPath, {
                success: function () {
                    MessageToast.show("Store deleted successfully.");
                },
                error: function () {
                    MessageToast.show("Error while deleting Store.");
                }
            });

            oRouter.navTo("StoreList");
        },

        _handleDeleteProduct: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("odata");

            const oODataModel = oCtx.getModel("odata");

            const sPath = oODataModel.createKey("/Products", oCtx.getObject());

            oODataModel.remove(sPath, {
                success: function () {
                    MessageToast.show("Product deleted successfully.");
                },
                error: function () {
                    MessageToast.show("Error while deleting product.");
                }
            });
        },


        _createFilterStatusWithSearch: function (filterValue, sSearchValue) {
            if (filterValue === FILTER_ALL_ITEM) {
                return this._createFiltersForSearch(sSearchValue);
            } else {
                return sSearchValue ? new Filter({
                        filters: [
                            this._createFiltersForSearch(sSearchValue),
                            new Filter({
                                path: "Status",
                                operator: FilterOperator.EQ,
                                value1: filterValue
                            }),
                        ],
                        and: true
                    }) :
                    new Filter({
                        path: "Status",
                        operator: FilterOperator.EQ,
                        value1: filterValue
                    });
            }
        },

        _createFiltersForSearch: function (sSearchValue) {
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

        _performProductSearch: function (sSearchValue) {
            const oTable = this.byId("ProductsTable");
            const sStoreId = this.getView().getModel("selectedIds").getProperty("/StoreID");
            const oODataModel = this.getView().getModel("odata");

            const filterType = this.byId("FilterBar").getSelectedKey();
            const oFilter = this._createFilterStatusWithSearch(filterType, sSearchValue);
            oTable.getBinding("items").filter(oFilter);

            this._updateAllFilters(oODataModel, sStoreId, sSearchValue);
        },

        _getProductsFilterCount: function (storeId, filterType, oODataModel, sSearchValue, onSuccess) {
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

            if (sSearchValue) {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        this._createFiltersForSearch(sSearchValue),
                    ],
                    and: true
                });
            }


            oODataModel.read("/Products/$count", {
                filters: [oFilter],
                success: function (data) {
                    onSuccess(data);
                },
            });
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

            const oData = this.oSortModel.getData();

            for (const key in oData) {
                this.oSortModel.setProperty(`/${key}`, SORT_NONE);
            }
        },

        _clearSearch: function () {
            const oSearchField = this.byId("ProductSearchField");
            oSearchField.setValue("");
        },

        _clearFilters: function () {
            const oTable = this.byId("ProductsTable");
            const oFilterBar = this.byId("FilterBar");

            oTable.getBinding("items").filter(null);

            oFilterBar.setSelectedKey(FILTER_ALL_ITEM);
        },


        _compareFunction: function (value1, value2) {

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