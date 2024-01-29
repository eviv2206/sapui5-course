/**
 * StoreDetails controller for the SAPUI5 application.
 *
 * @class
 * @constructor
 * @public
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../util/Constants",
    "../util/Routing",
    "../util/Utility",
    "../util/Validation",
    "../util/Form",
], function (
    Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox,
    MessageToast, Constants, Routing, Utility, Validation, Form
) {
    "use strict";

    /**
     * Array containing constants representing input fields in a product dialog.
     *
     * @type {string[]}
     * @constant
     * @memberof Constants
     * @property {string} NAME_INPUT - Represents the input field for the product name.
     * @property {string} PRICE_INPUT - Represents the input field for the product price.
     * @property {string} SPECS_INPUT - Represents the input field for the product specifications.
     * @property {string} RATING_INPUT - Represents the input field for the product rating.
     * @property {string} SUPPLIER_INFO_INPUT - Represents the input field for the product supplier information.
     * @property {string} MADE_IN_INPUT - Represents the input field for the product's country of origin.
     * @property {string} PRODUCTION_COMPANY_NAME_INPUT - Represents the input field for the product production company name.
     */
    const DIALOG_FIELDS = [
        Constants.PRODUCT_DIALOG_VIEW_ID.NAME_INPUT,
        Constants.PRODUCT_DIALOG_VIEW_ID.PRICE_INPUT,
        Constants.PRODUCT_DIALOG_VIEW_ID.SPECS_INPUT,
        Constants.PRODUCT_DIALOG_VIEW_ID.RATING_INPUT,
        Constants.PRODUCT_DIALOG_VIEW_ID.SUPPLIER_INFO_INPUT,
        Constants.PRODUCT_DIALOG_VIEW_ID.MADE_IN_INPUT,
        Constants.PRODUCT_DIALOG_VIEW_ID.PRODUCTION_COMPANY_NAME_INPUT
    ];
    
    return Controller.extend("yauheni.sapryn.controller.StoreDetails", {
        /**
         * Lifecycle hook that is called when the controller is initialized.
         *
         * @public
         * @override
         */
        onInit: function () {
            this.getView().addEventDelegate({onBeforeHide: this._onBeforeHide}, this)

            const oRouter = this.getOwnerComponent().getRouter();

            this.oSortModel = new JSONModel({
                Name: Constants.SORT_NONE,
                Price: Constants.SORT_NONE,
                Specs: Constants.SORT_NONE,
                SupplierInfo: Constants.SORT_NONE,
                MadeIn: Constants.SORT_NONE,
                ProductionCompanyName: Constants.SORT_NONE,
                Rating: Constants.SORT_NONE,
            });

            this.appViewModel = new JSONModel({
                isUpdate: false,
                isSortButtonVisibleDesktop: true,
                SortNameIcon: Constants.SORT_NONE_ICON,
                SortPriceIcon: Constants.SORT_NONE_ICON,
                SortSpecsIcon: Constants.SORT_NONE_ICON,
                SortSupplierInfoIcon: Constants.SORT_NONE_ICON,
                SortMadeInIcon: Constants.SORT_NONE_ICON,
                SortProductionCompanyNameIcon: Constants.SORT_NONE_ICON,
                SortRatingIcon: Constants.SORT_NONE_ICON,
            });

            this.getView().setModel(this.appViewModel, "appView");

            oRouter.getRoute(Constants.STORE_DETAILS_ROUTE).attachPatternMatched(this.onPatternMatched, this);
            sap.ui.Device.media.attachHandler(this._sizeChanged.bind(this), null, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
            this._sizeChanged(sap.ui.Device.media.getCurrentRange(sap.ui.Device.media.RANGESETS.SAP_STANDARD));
        },

        /**
         * Lifecycle hook that is called after the view has been rendered.
         *
         * @public
         * @override
         */
        onAfterRendering: function () {
            this.i18nModel = this.getView().getModel(Constants.I18N_MODEL);
        },

        /**
         * Event handler for the "patternMatched" event of the router.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onPatternMatched: function (oEvent) {
            const oODataModel = this.getView().getModel();
            oODataModel.metadataLoaded().then(() => {
                this._onMetadataLoaded(oEvent, oODataModel);
            });
        },

        /**
         * Event handler for pressing a link without parameters.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onLinkWithoutParamPress: function (oEvent) {
            Routing.onLinkWithoutParamPress.call(this, oEvent.getSource().getProperty("target"));
        },

        /**
         * Event handler for pressing a table item.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onTableItemPress: function (oEvent) {
            const oSource = oEvent.getSource();

            const oCtx = oSource.getBindingContext();

            const productId = oCtx.getObject("id");

            Routing.onLinkWithParamsPress.call(this, Constants.PRODUCT_DETAILS_ROUTE, {
                StoreID: this.getView().getBindingContext().getProperty("id"),
                ProductID: productId,
            });
        },

        /**
         * Event handler for the product search functionality.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onProductSearch: function (oEvent) {
            const sSearchValue = oEvent.getParameter("query");
            this._performProductSearch(sSearchValue);
        },

        /**
         * Event handler for pressing the "Sort" button.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onSortButtonPress: function (oEvent) {
            const oSortButton = oEvent.getSource();
            const sSortBy = oSortButton.data("sortBy");

            let sSortIcon = Constants.SORT_NONE_ICON;
            let sSortType = this.oSortModel.getProperty(`/${sSortBy}`);

            this._clearAllSorting();

            const oProductsTable = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCTS_TABLE);
            const oItemsBinding = oProductsTable.getBinding("items");

            switch (sSortType) {
                case Constants.SORT_NONE: {
                    sSortType = Constants.SORT_ASC;
                    sSortIcon = Constants.SORT_ASC_ICON;
                    break;
                }

                case Constants.SORT_ASC: {
                    sSortType = Constants.SORT_DESC;
                    sSortIcon = Constants.SORT_DESC_ICON;
                    break;
                }

                case Constants.SORT_DESC: {
                    sSortType = Constants.SORT_NONE;
                    sSortIcon = Constants.SORT_NONE_ICON;
                    break;
                }
            }

            this.oSortModel.setProperty(`/${sSortBy}`, sSortType);
            this.appViewModel.setProperty(`/Sort${sSortBy}Icon`, sSortIcon);

            if (sSortType === Constants.SORT_ASC || sSortType === Constants.SORT_DESC) {
                const bSortDesc = sSortType === Constants.SORT_DESC;
                const oSorter = new Sorter(sSortBy, bSortDesc);
                oSorter.fnCompare = Utility.compareFunction;
                oItemsBinding.sort(oSorter);
            }
        },

        /**
         * Event handler for selecting a filter.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onFilterSelect: function (oEvent) {
            const oBinding = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCTS_TABLE).getBinding("items");
            const sKey = oEvent.getParameter("key");
            const sSearchValue = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCT_SEARCH_FIELD).getValue();

            const oFilters = this._createFilterStatusWithSearch(sKey, sSearchValue);

            oBinding.filter(oFilters);
        },

        /**
         * Event handler for pressing the "Delete Product" button.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onDeleteProductButtonPress: function (oEvent) {
            this._showMessageBox(
                this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.MESSAGE_CONFIRM_TITLE),
                this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.DELETE_PRODUCT_TEXT),
                () => this._handleDeleteProduct(oEvent),
            );
        },

        /**
         * Event handler for pressing the "Create Product" button.
         *
         * @async
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onCreateProductButtonPress: async function (oEvent) {
            const oView = this.getView();
            const oODataModel = oView.getModel();

            const oEntryCtx = oODataModel.createEntry(`/${Constants.PRODUCTS_URL_PATH}`, {
                properties: {
                    StoreId: this.getView().getBindingContext().getProperty("id"),
                    Status: Constants.STATUS_TYPE_OK
                },
                success: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.CREATE_PRODUCT_SUCCESS_TEXT));
                },
                error: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.CREATE_PRODUCT_FAIL_TEXT));
                }
            });

            if (!this.oDialog) {
                this.oDialog = await this.loadFragment({name: "yauheni.sapryn.view.fragments.ProductDialog"});
            }

            this._configureDialogFields(
                this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.PRODUCT_DIALOG_CREATE_TITLE),
                DIALOG_FIELDS,
                Constants.PRODUCT_DIALOG_VIEW_ID.SUBMIT_BTN,
                this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.CREATE_BTN_TEXT),
                (oEvent) => this._onDialogCreateBtn(oEvent)
            );

            this.oDialog.setBindingContext(oEntryCtx);

            this.oDialog.setModel(oODataModel);

            this.oDialog.open();
        },

        /**
         * Event handler for pressing the "Update Product" button.
         *
         * @async
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onUpdateProductButtonPress: async function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            const oODataModel = oCtx.getModel();

            if (!this.oDialog) {
                this.oDialog = await this.loadFragment({name: "yauheni.sapryn.view.fragments.ProductDialog"});
            }

            this._configureDialogFields(
                this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.PRODUCT_DIALOG_UPDATE_TITLE),
                DIALOG_FIELDS,
                Constants.PRODUCT_DIALOG_VIEW_ID.SUBMIT_BTN,
                this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.UPDATE_BTN_TEXT),
                (oEvent) => this._onDialogUpdateBtn(oEvent)
            );

            this.appViewModel.setProperty("/isUpdate", true);

            this.oDialog.setModel(oODataModel);
            this.oDialog.setBindingContext(oCtx);

            this.oDialog.open();
        },

        /**
         * Event handler for pressing the "Cancel" button in the dialog.
         *
         * @public
         */
        onDialogCancelBtn: function () {
            const oODataModel = this.getView().getModel();
            if (!this.appViewModel.getProperty("/isUpdate")) {
                const oCtx = this.oDialog.getBindingContext();
                oODataModel.deleteCreatedEntry(oCtx);
            } else {
                this.appViewModel.setProperty("/isUpdate", false);
            }

            oODataModel.resetChanges();
            this.oDialog.close();
            this.oDialog.destroy();
            this.oDialog = null;
        },

        /**
         * Event handler for pressing the "Delete Store" button.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onDeleteStoreButtonPress: function (oEvent) {
            this._showMessageBox(
                this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.MESSAGE_CONFIRM_TITLE),
                this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.DELETE_STORE_TEXT),
                () => this._handleDeleteStore.call(this, oEvent),
            );
        },

        /**
         * Event handler for live change of input fields.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onLiveChange: function (oEvent) {
            const oControl = oEvent.getSource();
            Validation.validateField(oControl);
        },

        /**
         * Private method for handling the "Create" button press in the dialog.
         *
         * @private
         */
        _onDialogCreateBtn: function () {
            if (!Validation.isValidForm.call(this, DIALOG_FIELDS)) {
                MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.CREATE_PRODUCT_FAIL_TEXT));
                return;
            }
            const oODataModel = this.getView().getModel();
            oODataModel.submitChanges();

            this._updateAllFiltersCount(
                oODataModel,
                this.getView().getBindingContext().getProperty("id"),
                this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCT_SEARCH_FIELD).getValue()
            );

            this.oDialog.close();
            this.oDialog.destroy();
            this.oDialog = null;
        },

        /**
         * Private method for handling the "Update" button press in the dialog.
         *
         * @private
         * @param {sap.ui.base.Event} oEvent The event object
         */
        _onDialogUpdateBtn: function (oEvent) {
            if (!Validation.isValidForm.call(this, DIALOG_FIELDS)) {
                MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.UPDATE_PRODUCT_FAIL_TEXT));
                return;
            }
            const oCtx = oEvent.getSource().getBindingContext();

            const oODataModel = oCtx.getModel();

            const sKey = oODataModel.createKey("/Products", oCtx.getObject());

            oODataModel.update(sKey, oCtx.getObject(), {
                success: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.UPDATE_PRODUCT_SUCCESS_TEXT));
                },
                error: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DIALOG_I18N.UPDATE_PRODUCT_FAIL_TEXT));
                }
            });

            this.appViewModel.setProperty("/isUpdate", false);

            this._updateAllFiltersCount(
                oODataModel,
                this.getView().getBindingContext().getProperty("id"),
                this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCT_SEARCH_FIELD).getValue()
            );

            this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCTS_TABLE).getBinding("items").refresh();

            this.oDialog.close();
            this.oDialog.destroy();
            this.oDialog = null;
        },

        /**
         * Private method for updating the count of products for each filter.
         *
         * @private
         * @param {sap.ui.model.odata.v2.ODataModel} oODataModel The OData model
         * @param {number} iStoreID The ID of the store
         * @param {string} sSearchValue The search value
         */
        _updateAllFiltersCount: function (oODataModel, iStoreID, sSearchValue) {
            this._getProductsFilterCount(iStoreID, Constants.STATUS_TYPE_ALL, oODataModel, sSearchValue, (length) => {
                this.byId(Constants.STORE_DETAILS_VIEW_ID.FILTER_ALL).setCount(length);
            });

            this._getProductsFilterCount(iStoreID, Constants.STATUS_TYPE_OK, oODataModel, sSearchValue, (length) => {
                this.byId(Constants.STORE_DETAILS_VIEW_ID.FILTER_OK).setCount(length);
            });

            this._getProductsFilterCount(iStoreID, Constants.STATUS_TYPE_STORAGE, oODataModel, sSearchValue, (length) => {
                this.byId(Constants.STORE_DETAILS_VIEW_ID.FILTER_STORAGE).setCount(length);
            });

            this._getProductsFilterCount(iStoreID, Constants.STATUS_TYPE_OUT_OF_STOCK, oODataModel, sSearchValue, (length) => {
                this.byId(Constants.STORE_DETAILS_VIEW_ID.FILTER_OUT_OF_STOCK).setCount(length);
            });
        },

        /**
         * Private method for handling the "BeforeHide" event.
         *
         * @private
         * @param {sap.ui.base.Event} oEvent The event object
         */
        _onBeforeHide: function (oEvent) {
            this._clearSearch();
            this._clearAllSorting();
            this._clearFilters();
        },

        /**
         * Private method for showing a confirmation message box.
         *
         * @private
         * @param {string} title The title of the message box
         * @param {string} message The message in the message box
         * @param {Function} onConfirm The callback function for confirmation
         */
        _showMessageBox: function (title, message, onConfirm) {
            MessageBox.confirm(
                message,
                {
                    title: title,
                    onClose: (oAction) => {
                        if (oAction === MessageBox.Action.OK) {
                            onConfirm();
                        }
                    },
                },
            );
        },

        /**
         * Private method for handling the deletion of a store.
         *
         * @private
         * @param {sap.ui.base.Event} oEvent The event object
         */
        _handleDeleteStore: function (oEvent ) {
            const oRouter = this.getOwnerComponent().getRouter();

            const oCtx = oEvent.getSource().getBindingContext();

            const oODataModel = oCtx.getModel();

            const sPath = oODataModel.createKey(`/${Constants.STORES_URL_PATH}`, oCtx.getObject());

            oODataModel.remove(sPath, {
                success: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.DELETE_STORE_SUCCESS_TEXT));
                    setTimeout(() => {
                        oRouter.navTo(Constants.STORE_DETAILS_VIEW_ID.STORE_LIST);
                    }, 200);
                },
                error: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.DELETE_STORE_FAIL_TEXT));
                },
            });
        },

        /**
         * Private method for handling the deletion of a product.
         *
         * @private
         * @param {sap.ui.base.Event} oEvent The event object
         */
        _handleDeleteProduct: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();

            const oODataModel = oCtx.getModel();

            const sPath = oODataModel.createKey(`/${Constants.PRODUCTS_URL_PATH}`, oCtx.getObject());

            oODataModel.remove(sPath, {
                success: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.DELETE_PRODUCT_SUCCESS_TEXT));
                    this._updateAllFiltersCount(oODataModel, this.getView().getBindingContext().getProperty("id"), this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCT_SEARCH_FIELD).getValue());
                },
                error: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.MESSAGE_BOX_I18N.DELETE_PRODUCT_FAIL_TEXT));
                },
            });
        },

        /**
         * Private method for creating a filter based on the status and search value.
         *
         * @private
         * @param {string} sFilterValue The value of the filter
         * @param {string} sSearchValue The search value
         * @returns {sap.ui.model.Filter} The created filter
         */
        _createFilterStatusWithSearch: function (sFilterValue, sSearchValue) {
            if (sFilterValue === Constants.STORE_DETAILS_VIEW_ID.FILTER_ALL) {
                return this._createFiltersForSearch(sSearchValue);
            } else {
                return sSearchValue ? new Filter({
                        filters: [
                            this._createFiltersForSearch(sSearchValue),
                            new Filter({
                                path: Constants.PRODUCT_FILTER_PATH.STATUS,
                                operator: FilterOperator.EQ,
                                value1: sFilterValue,
                            }),
                        ],
                        and: true
                    }) :
                    new Filter({
                        path: Constants.PRODUCT_FILTER_PATH.STATUS,
                        operator: FilterOperator.EQ,
                        value1: sFilterValue,
                    });
            }
        },

        /**
         * Private method for creating filters based on search value.
         *
         * @private
         * @param {string} sSearchValue The search value
         * @returns {sap.ui.model.Filter} The created filter
         */
        _createFiltersForSearch: function (sSearchValue) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: Constants.PRODUCT_FILTER_PATH.NAME,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                    new Filter({
                        path: Constants.PRODUCT_FILTER_PATH.SPECS,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                    new Filter({
                        path: Constants.PRODUCT_FILTER_PATH.SUPPLIER_INFO,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                    new Filter({
                        path: Constants.PRODUCT_FILTER_PATH.MADE_IN,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                    new Filter({
                        path: Constants.PRODUCT_FILTER_PATH.PRODUCTION_COMPANY_NAME,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                ],
                or: true,
            });

            if (+sSearchValue) {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        new Filter({
                            path: Constants.PRODUCT_FILTER_PATH.PRICE,
                            operator: FilterOperator.EQ,
                            value1: +sSearchValue,
                        }),
                        new Filter({
                            path: Constants.PRODUCT_FILTER_PATH.RATING,
                            operator: FilterOperator.EQ,
                            value1: +sSearchValue,
                        }),
                    ],
                    or: true,
                })
            }
            return oFilter;
        },

        /**
         * Private method for performing a product search and updating filters count.
         *
         * @private
         * @param {string} sSearchValue The search value
         */
        _performProductSearch: function (sSearchValue) {
            const oTable = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCTS_TABLE);
            const sStoreId = this.getView().getBindingContext().getProperty("id");

            const oODataModel = this.getView().getModel();

            const filterType = this.byId(Constants.STORE_DETAILS_VIEW_ID.FILTER_BAR).getSelectedKey();
            const oFilter = this._createFilterStatusWithSearch(filterType, sSearchValue);
            oTable.getBinding("items").filter(oFilter);

            this._updateAllFiltersCount(oODataModel, sStoreId, sSearchValue);
        },

        /**
         * Private method for getting the filter count for products.
         *
         * @private
         * @param {number} iStoreId The ID of the store
         * @param {string} sFilterType The type of the filter
         * @param {sap.ui.model.odata.v2.ODataModel} oODataModel The OData model
         * @param {string} sSearchValue The search value
         * @param {Function} fOnSuccess The success callback function
         */
        _getProductsFilterCount: function (iStoreId, sFilterType, oODataModel, sSearchValue, fOnSuccess) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: Constants.PRODUCT_FILTER_PATH.STORE_ID,
                        operator: FilterOperator.EQ,
                        value1: iStoreId,
                    }),
                ],
            });

            if (!!sFilterType) {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        new Filter({
                            path: Constants.PRODUCT_FILTER_PATH.STATUS,
                            operator: FilterOperator.EQ,
                            value1: sFilterType,
                        }),
                    ],
                    and: true,
                });
            }

            if (sSearchValue) {
                oFilter = new Filter({
                    filters: [
                        oFilter,
                        this._createFiltersForSearch(sSearchValue),
                    ],
                    and: true,
                });
            }


            oODataModel.read(`/${Constants.PRODUCTS_URL_PATH}/$count`, {
                filters: [oFilter],
                success: function (data) {
                    fOnSuccess(data);
                },
            });
        },

        /**
         * Private method for clearing all sorting in the products table.
         *
         * @param {sap.ui.base.Event} oEvent The event object
         * @private
         */
        _clearAllSorting: function (oEvent) {
            const oTable = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCTS_TABLE);
            oTable.getBinding("items").sort(new Sorter({path: "id", descending: false}));

            const oData = this.oSortModel.getData();

            for (const key in oData) {
                this.oSortModel.setProperty(`/${key}`, Constants.SORT_NONE);
                this.appViewModel.setProperty(`/Sort${key}Icon`, Constants.SORT_NONE_ICON);
            }

        },

        /**
         * Private method for clearing the search field.
         *
         * @private
         */
        _clearSearch: function () {
            const oSearchField = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCT_SEARCH_FIELD);
            oSearchField.setValue("");
        },

        /**
         * Private method for clearing filters in the products table.
         *
         * @private
         */
        _clearFilters: function () {
            const oTable = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCTS_TABLE);
            const oFilterBar = this.byId(Constants.STORE_DETAILS_VIEW_ID.FILTER_BAR);

            oTable.getBinding("items").filter([]);

            oFilterBar.setSelectedKey(Constants.STORE_DETAILS_VIEW_ID.FILTER_ALL);
        },

        /**
         * Private method for configuring dialog fields.
         *
         * @private
         * @param {string} sTitle The title of the dialog
         * @param {Array} aFields The array of field names
         * @param {string} sSubmitBtnId The ID of the submit button
         * @param {string} sSubmitBtnText The text of the submit button
         * @param {Function} fOnSubmit The submit callback function
         */
        _configureDialogFields: function (sTitle, aFields, sSubmitBtnId, sSubmitBtnText, fOnSubmit) {
            Form.registerFields.call(this, aFields);

            this.oDialog.setProperty("title", sTitle);
            this.byId(sSubmitBtnId).setText(sSubmitBtnText);
            this.byId(sSubmitBtnId).attachPress(fOnSubmit);
        },

        /**
         * Private method for handling the metadata loaded event.
         *
         * @private
         * @param {sap.ui.base.Event} oEvent The event object
         * @param {sap.ui.model.odata.v2.ODataModel} oODataModel The OData model
         */
        _onMetadataLoaded: function (oEvent, oODataModel) {
            const sStoreID = oEvent.getParameter("arguments").StoreID;

            const sPath = oODataModel.createKey(`/${Constants.STORES_URL_PATH}`, {
                id: oEvent.getParameter("arguments").StoreID,
            });

            this.getView().bindObject({
                path: sPath,
            });

            const sSearchValue = this.byId(Constants.STORE_DETAILS_VIEW_ID.PRODUCT_SEARCH_FIELD).getValue();

            this._updateAllFiltersCount(oODataModel, sStoreID, sSearchValue);
        },

        /**
         * Private method for handling changes in screen size.
         *
         * @private
         * @param {Object} mParams The parameters object
         */
        _sizeChanged: function (mParams) {
            if (mParams.name === sap.m.ScreenSize.Desktop) {
                this.appViewModel.setProperty("/isSortButtonVisibleDesktop", true);
                this.appViewModel.setProperty("/isSortButtonVisibleTablet", true);
            } else if (mParams.name === sap.m.ScreenSize.Tablet){
                this.appViewModel.setProperty("/isSortButtonVisibleDesktop", false);
                this.appViewModel.setProperty("/isSortButtonVisibleTablet", true);
            } else {
                this.appViewModel.setProperty("/isSortButtonVisibleDesktop", false);
                this.appViewModel.setProperty("/isSortButtonVisibleTablet", false);
            }
        },
    });
});