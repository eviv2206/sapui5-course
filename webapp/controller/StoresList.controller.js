/**
 * StoresList controller for the SAPUI5 application.
 *
 * @class
 * @constructor
 * @public
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/date/UI5Date",
    "../util/Constants",
    "../util/Routing",
    "../util/Form",
    "../util/Validation",
    "yauheni/sapryn/type/EmailType",
], function (
    Controller, Filter, FilterOperator, MessageToast, UI5Date, Constants, Routing, Form, Validation
) {
    "use strict";

    /**
     * Array containing constants representing input fields in a store dialog.
     *
     * @type {string[]}
     * @constant
     * @memberof Constants
     * @property {string} NAME_INPUT - Represents the input field for the store name.
     * @property {string} EMAIL_INPUT - Represents the input field for the store email.
     * @property {string} PHONE_NUMBER_INPUT - Represents the input field for the store phone number.
     * @property {string} ADDRESS_INPUT - Represents the input field for the store address.
     * @property {string} ESTABLISHED_INPUT - Represents the input field for the store establishment date.
     * @property {string} FLOOR_AREA_INPUT - Represents the input field for the store floor area.
     */
    const DIALOG_FIELDS = [
        Constants.STORE_DIALOG_VIEW_ID.NAME_INPUT, Constants.STORE_DIALOG_VIEW_ID.EMAIL_INPUT,
        Constants.STORE_DIALOG_VIEW_ID.PHONE_NUMBER_INPUT, Constants.STORE_DIALOG_VIEW_ID.ADDRESS_INPUT,
        Constants.STORE_DIALOG_VIEW_ID.ESTABLISHED_INPUT, Constants.STORE_DIALOG_VIEW_ID.FLOOR_AREA_INPUT
    ];

    return Controller.extend("yauheni.sapryn.controller.StoresList", {

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
         * Event handler for the search store.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onSearch: function (oEvent) {
            const sSearchValue = oEvent.getParameter("query");
            this._performStoreSearch(sSearchValue);
        },

        /**
         * Event handler for the product item press event.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onListItemPress: function (oEvent) {
            const oSource = oEvent.getSource();

            const oCtx = oSource.getBindingContext();

            const oComponent = this.getOwnerComponent();

            const storeId = oCtx.getProperty("id");

            oComponent.getRouter().navTo(Constants.STORE_DETAILS_ROUTE, {
                StoreID: storeId,
            });
        },

        /**
         * Event handler for the "Create Store" button press.
         *
         * @async
         * @public
         */
        onCreateBtnPress: async function () {
            const oView = this.getView();
            const oODataModel = oView.getModel();

            if (!this.oDialog) {
                this.oDialog = await this.loadFragment({name: "yauheni.sapryn.view.fragments.StoreDialog"});
            }

            this._configureDialogField(
                DIALOG_FIELDS,
                Constants.STORE_DIALOG_VIEW_ID.ESTABLISHED_INPUT,
                UI5Date.getInstance(2000, 0, 1),
                UI5Date.getInstance(),
                this.i18nModel.getProperty(Constants.STORE_DIALOG_I18N.STORE_DIALOG_TITLE)
            );

            const oEntryCtx = oODataModel.createEntry(`/${Constants.STORES_URL_PATH}`, {
                success: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.STORE_DIALOG_I18N.CREATE_STORE_SUCCESS_TEXT));
                },
                error: () => {
                    MessageToast.show(this.i18nModel.getProperty(Constants.STORE_DIALOG_I18N.CREATE_STORE_FAIL_TEXT));
                },
            });

            this.oDialog.setBindingContext(oEntryCtx);
            this.oDialog.setModel(oODataModel);
            this.oDialog.open();
        },

        /**
         * Event handler for the "Create" button in the store dialog.
         *
         * @public
         */
        onDialogCreateBtn: function () {
            if (!Validation.isValidForm.call(this, DIALOG_FIELDS)) {
                MessageToast.show(this.i18nModel.getProperty(Constants.STORE_DIALOG_I18N.CREATE_STORE_FAIL_TEXT));
                return;
            }

            const oODataModel = this.getView().getModel();
            oODataModel.submitChanges();

            this.oDialog.close();
            this.oDialog.destroy();
            this.oDialog = null;
        },


        /**
         * Event handler for the "Cancel" button in the store dialog.
         *
         * @public
         */
        onDialogCancelBtn: function () {
            const oODataModel = this.getView().getModel();
            const oCtx = this.oDialog.getBindingContext();
            oODataModel.deleteCreatedEntry(oCtx);
            Form.resetFieldsError.call(this, DIALOG_FIELDS);
            this.oDialog.close();
        },

        /**
         * Event handler for the live change event of input fields.
         *
         * @public
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onLiveChange: function (oEvent) {
            const oControl = oEvent.getSource();
            Validation.validateField(oControl);
        },

        /**
         * Performs a search for stores based on the provided search value.
         *
         * @private
         * @param {string} sSearchValue The search value
         */
        _performStoreSearch: function (sSearchValue) {
            const oList = this.byId(Constants.STORE_LIST_VIEW_ID.STORES_LIST_VIEW);
            const oFilter = this._createFiltersForSearch(sSearchValue);
            oList.getBinding("items").filter(oFilter);
        },

        /**
         * Creates filters for the search functionality.
         *
         * @private
         * @param {string} sSearchValue The search value
         * @returns {sap.ui.model.Filter} The filter object
         */
        _createFiltersForSearch: function (sSearchValue) {
            let oFilter = new Filter({
                filters: [
                    new Filter({
                        path: Constants.STORE_FILTER_PATH.NAME,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue,
                    }),
                    new Filter({
                        path: Constants.STORE_FILTER_PATH.ADDRESS,
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
                            path: Constants.STORE_FILTER_PATH.FLOOR_AREA,
                            operator: FilterOperator.EQ,
                            value1: +sSearchValue
                        }),
                    ],
                    or: true,
                })
            }

            return oFilter;
        },

        /**
         * Configures the fields in the dialog, including registering them, setting date picker properties,
         * and updating the dialog title.
         *
         * @private
         * @param {string[]} aDialogFields - An array of IDs representing the dialog fields.
         * @param {string} sDatePickerId - The ID of the date picker field in the dialog.
         * @param {sap.ui.core.date.UI5Date} oMinDate - The minimum date for the date picker.
         * @param {sap.ui.core.date.UI5Date} oMaxDate - The maximum date for the date picker.
         * @param {string} sTitle - The title for the dialog.
         */
        _configureDialogField: function (aDialogFields, sDatePickerId, oMinDate, oMaxDate, sTitle) {
            Form.registerFields.call(this, aDialogFields);

            const oDatePicker = this.byId(sDatePickerId);
            oDatePicker.setMinDate(oMinDate);
            oDatePicker.setMaxDate(oMaxDate);

            this.oDialog.setProperty("title", sTitle);
        }

    });
});