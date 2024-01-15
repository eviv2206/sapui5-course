sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../Constants",
], function (Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox, MessageToast, Constants) {
    "use strict";

    const FILTER_PATH = {
        STATUS: "Status",
        NAME: "Name",
        SPECS: "Specs",
        SUPPLIER_INFO: "SupplierInfo",
        MADE_IN: "MadeIn",
        PRODUCTION_COMPANY_NAME: "ProductionCompanyName",
        PRICE: "Price",
        RATING: "Rating",
        STORE_ID: "StoreId",
    }

    const VIEW_ID = {
        PRODUCT_SEARCH_FIELD: "ProductSearchField",
        PRODUCTS_TABLE: "ProductsTable",
        STORE_LIST: "StoreList",
        FILTER_BAR: "FilterBar",
        FILTER_ALL: "FilterAll",
        FILTER_OK: "FilterOk",
        FILTER_STORAGE: "FilterStorage",
        FILTER_OUT_OF_STOCK: "FilterOutOfStock",
    }

    const MESSAGES = {
        TITLE_CONFIRMATION: "Confirmation",

        DELETE_PRODUCT_MESSAGE: "Are you sure you want to delete this product?",
        DELETE_PRODUCT_SUCCESS_MESSAGE: "Product deleted successfully.",
        DELETE_PRODUCT_FAILURE_MESSAGE: "Error while deleting product.",

        DELETE_STORE_MESSAGE: "Are you sure you want to delete this store?",
        DELETE_STORE_SUCCESS_MESSAGE: "Store deleted successfully.",
        DELETE_STORE_FAILURE_MESSAGE: "Error while deleting store.",

    }

    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {

        onInit: function () {
            this.getView().addEventDelegate({onBeforeHide: this._onBeforeHide}, this)

            const oRouter = this.getOwnerComponent().getRouter();
            const oCurrentRoute = oRouter.getHashChanger().getHash();
            const oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel(Constants.SELECTED_IDS_MODEL).setProperty("/StoreID", oParameters.arguments.StoreID);

            this.oSortModel = new JSONModel({
                Name: Constants.SORT_NONE,
                Price: Constants.SORT_NONE,
                Specs: Constants.SORT_NONE,
                SupplierInfo: Constants.SORT_NONE,
                MadeIn: Constants.SORT_NONE,
                ProductionCompanyName: Constants.SORT_NONE,
                Rating: Constants.SORT_NONE,
            });

            oRouter.getRoute(Constants.STORE_DETAILS_ROUTE).attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sStoreID = mRouteArguments.StoreID;
            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);
            oODataModel.metadataLoaded().then(() => {

                const sPath = oODataModel.createKey(`/${Constants.STORES_URL_PATH}`, {id: sStoreID});
                this.getView().bindObject({
                    path: sPath,
                    model: Constants.ODATA_MODEL
                });

                const sSearchValue = this.byId(VIEW_ID.PRODUCT_SEARCH_FIELD).getValue();

                this._updateAllFilters(oODataModel, sStoreID, sSearchValue);
            });
        },

        _onBeforeHide: function (oEvent) {
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

            const oProductsTable = this.byId(VIEW_ID.PRODUCTS_TABLE);
            const oItemsBinding = oProductsTable.getBinding("items");

            switch (sSortType) {
                case Constants.SORT_NONE: {
                    sSortType = Constants.SORT_ASC;
                    oSortButton.setIcon(Constants.SORT_ASC_ICON);
                    break;
                }

                case Constants.SORT_ASC: {
                    sSortType = Constants.SORT_DESC;
                    oSortButton.setIcon(Constants.SORT_DESC_ICON);
                    break;
                }

                case Constants.SORT_DESC: {
                    sSortType = Constants.SORT_NONE;
                    oSortButton.setIcon(Constants.SORT_NONE_ICON);
                    break;
                }
            }

            this.oSortModel.setProperty(`/${sSortBy}`, sSortType);

            if (sSortType === Constants.SORT_ASC || sSortType === Constants.SORT_DESC) {
                const bSortDesc = sSortType === Constants.SORT_DESC;
                const oSorter = new Sorter(sSortBy, bSortDesc);
                oSorter.fnCompare = this._compareFunction;
                oItemsBinding.sort(oSorter);
            }
        },

        onFilterSelect: function (oEvent) {
            const oBinding = this.byId(VIEW_ID.PRODUCTS_TABLE).getBinding("items");
            const sKey = oEvent.getParameter("key");
            const sSearchValue = this.byId(VIEW_ID.PRODUCT_SEARCH_FIELD).getValue();

            const oFilters = this._createFilterStatusWithSearch(sKey, sSearchValue);

            oBinding.filter(oFilters);
        },

        onDeleteProductButtonPress: function (oEvent) {
            this._showMessageBox(
                MESSAGES.TITLE_CONFIRMATION,
                MESSAGES.DELETE_PRODUCT_MESSAGE,
                () => this._handleDeleteProduct(oEvent),
            );
        },

        onCreateProductButtonPress: function (oEvent) {
            const oView = this.getView();
            const oODataModel = oView.getModel(Constants.ODATA_MODEL);
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "yauheni.sapryn.view.fragments.ProductDialog", this);
                oView.addDependent(this.oDialog);
            }

            const oEntryCtx = oODataModel.createEntry(`/${Constants.PRODUCTS_URL_PATH}`);

            this.oDialog.setBindingContext(oEntryCtx);

            this.oDialog.setModel(oODataModel);

            this.oDialog.open();

        },

        onDeleteStoreButtonPress: function (oEvent) {
            this._showMessageBox(
                MESSAGES.TITLE_CONFIRMATION,
                MESSAGES.DELETE_STORE_MESSAGE,
                () => this._handleDeleteStore(oEvent, this),
            );
        },

        _updateAllFilters: function (oODataModel, sStoreID, sSearchValue) {
            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_ALL, oODataModel, sSearchValue, (length) => {
                this.byId(VIEW_ID.FILTER_ALL).setCount(length);
            });

            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_OK, oODataModel, sSearchValue, (length) => {
                this.byId(VIEW_ID.FILTER_OK).setCount(length);
            })

            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_STORAGE, oODataModel, sSearchValue, (length) => {
                this.byId(VIEW_ID.FILTER_STORAGE).setCount(length);
            });

            this._getProductsFilterCount(sStoreID, Constants.STATUS_TYPE_OUT_OF_STOCK, oODataModel, sSearchValue, (length) => {
                this.byId(VIEW_ID.FILTER_OUT_OF_STOCK).setCount(length);
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

            const oCtx = oEvent.getSource().getBindingContext(Constants.ODATA_MODEL);

            const oODataModel = oCtx.getModel(Constants.ODATA_MODEL);

            const sPath = oODataModel.createKey(`/${Constants.STORES_URL_PATH}`, oCtx.getObject());

            oODataModel.remove(sPath, {
                success: function () {
                    MessageToast.show(MESSAGES.DELETE_STORE_SUCCESS_MESSAGE);
                },
                error: function () {
                    MessageToast.show(MESSAGES.DELETE_STORE_FAILURE_MESSAGE);
                }
            });

            oRouter.navTo(VIEW_ID.STORE_LIST);
        },

        _handleDeleteProduct: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext(Constants.ODATA_MODEL);

            const oODataModel = oCtx.getModel(Constants.ODATA_MODEL);

            const sPath = oODataModel.createKey(`/${Constants.PRODUCTS_URL_PATH}`, oCtx.getObject());

            oODataModel.remove(sPath, {
                success: function () {
                    MessageToast.show(MESSAGES.DELETE_PRODUCT_SUCCESS_MESSAGE);
                },
                error: function () {
                    MessageToast.show(MESSAGES.DELETE_PRODUCT_FAILURE_MESSAGE);
                }
            });
        },


        _createFilterStatusWithSearch: function (filterValue, sSearchValue) {
            if (filterValue === VIEW_ID.FILTER_ALL) {
                return this._createFiltersForSearch(sSearchValue);
            } else {
                return sSearchValue ? new Filter({
                        filters: [
                            this._createFiltersForSearch(sSearchValue),
                            new Filter({
                                path: FILTER_PATH.STATUS,
                                operator: FilterOperator.EQ,
                                value1: filterValue
                            }),
                        ],
                        and: true
                    }) :
                    new Filter({
                        path: FILTER_PATH.STATUS,
                        operator: FilterOperator.EQ,
                        value1: filterValue
                    });
            }
        },

        _createFiltersForSearch: function (sSearchValue) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: FILTER_PATH.NAME,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: FILTER_PATH.SPECS,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: FILTER_PATH.SUPPLIER_INFO,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: FILTER_PATH.MADE_IN,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    }),
                    new Filter({
                        path: FILTER_PATH.PRODUCTION_COMPANY_NAME,
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
                            path: FILTER_PATH.PRICE,
                            operator: FilterOperator.EQ,
                            value1: +sSearchValue
                        }),
                        new Filter({
                            path: FILTER_PATH.RATING,
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
            const oTable = this.byId(VIEW_ID.PRODUCTS_TABLE);
            const sStoreId = this.getView().getModel(Constants.SELECTED_IDS_MODEL).getProperty("/StoreID");
            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);

            const filterType = this.byId(VIEW_ID.FILTER_BAR).getSelectedKey();
            const oFilter = this._createFilterStatusWithSearch(filterType, sSearchValue);
            oTable.getBinding("items").filter(oFilter);

            this._updateAllFilters(oODataModel, sStoreId, sSearchValue);
        },

        _getProductsFilterCount: function (storeId, filterType, oODataModel, sSearchValue, onSuccess) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: FILTER_PATH.STORE_ID,
                        operator: FilterOperator.EQ,
                        value1: storeId
                    })
                ],
            });

            if (!!filterType) {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        new Filter({
                            path: FILTER_PATH.STATUS,
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


            oODataModel.read(`/${Constants.PRODUCTS_URL_PATH}/$count`, {
                filters: [oFilter],
                success: function (data) {
                    onSuccess(data);
                },
            });
        },

        _clearAllSorting: function (oEvent) {
            const oTable = this.byId(VIEW_ID.PRODUCTS_TABLE);
            oTable.getBinding("items").sort(new Sorter({path: "id", descending: false}));

            const oColumns = oTable.getColumns();
            oColumns.forEach((column) => {
                if (column.getAggregation("header")) {
                    const oButton = column.getAggregation("header").getItems()[0];
                    oButton.setIcon(Constants.SORT_NONE_ICON);
                }
            });

            const oData = this.oSortModel.getData();

            for (const key in oData) {
                this.oSortModel.setProperty(`/${key}`, Constants.SORT_NONE);
            }

        },

        _clearSearch: function () {
            const oSearchField = this.byId(VIEW_ID.PRODUCT_SEARCH_FIELD);
            oSearchField.setValue("");
        },

        _clearFilters: function () {
            const oTable = this.byId(VIEW_ID.PRODUCTS_TABLE);
            const oFilterBar = this.byId(VIEW_ID.FILTER_BAR);

            oTable.getBinding("items").filter(null);

            oFilterBar.setSelectedKey(VIEW_ID.FILTER_ALL);
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