sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/Core",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/ui/core/date/UI5Date",
    "../Constants",
    "../util/Routing",
    "../util/Form",
    "../util/Validation",
    "yauheni/sapryn/type/EmailType",
], function (
    Controller, Filter, FilterOperator, MessageToast, Core, SimpleType, ValidateException, UI5Date, Constants,
    Routing, Form, Validation
) {
    "use strict";

    const VIEW_ID = {
        STORES_LIST_VIEW: "StoresList",
        DIALOG: {
            NAME_INPUT: "NameInput",
            EMAIL_INPUT: "EmailInput",
            PHONE_NUMBER_INPUT: "PhoneNumberInput",
            ADDRESS_INPUT: "AddressInput",
            ESTABLISHED_INPUT: "EstablishedInput",
            FLOOR_AREA_INPUT: "FloorAreaInput",
        }
    };

    const DIALOG_TITLE = "Create store";

    const DIALOG_FIELDS = [VIEW_ID.DIALOG.NAME_INPUT, VIEW_ID.DIALOG.EMAIL_INPUT, VIEW_ID.DIALOG.PHONE_NUMBER_INPUT, VIEW_ID.DIALOG.ADDRESS_INPUT, VIEW_ID.DIALOG.ESTABLISHED_INPUT, VIEW_ID.DIALOG.FLOOR_AREA_INPUT];

    const STORE_PATH = {
        NAME: "Name",
        ADDRESS: "Address",
        FLOOR_AREA: "FloorArea",
    };

    const MESSAGES = {
        STORE_CREATE_SUCCESS: "Store created successfully!",
        STORE_CREATE_ERROR: "Failed to create store.",
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

            const storeId = oCtx.getProperty("id");

            oComponent.getRouter().navTo(Constants.STORE_DETAILS_ROUTE, {
                StoreID: storeId,
            });
        },

        onCreateBtnPress: function () {
            const oView = this.getView();
            const oODataModel = oView.getModel(Constants.ODATA_MODEL);

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "yauheni.sapryn.view.fragments.StoreDialog", this);
                oView.addDependent(this.oDialog);
            }

            const oEntryCtx = oODataModel.createEntry(`/${Constants.STORES_URL_PATH}`, {
                success: function () {
                    MessageToast.show(MESSAGES.STORE_CREATE_SUCCESS);
                },
                error: function () {
                    MessageToast.show(MESSAGES.STORE_CREATE_ERROR);
                },
            });

            Form.registerFields.call(this, DIALOG_FIELDS);

            const oDatePicker = this.byId(VIEW_ID.DIALOG.ESTABLISHED_INPUT);
            oDatePicker.setProperty("minDate", UI5Date.getInstance(2000, 0, 1));
            oDatePicker.setProperty("maxDate", UI5Date.getInstance());

            this.oDialog.setProperty("title", DIALOG_TITLE);

            this.oDialog.setBindingContext(oEntryCtx);

            this.oDialog.setModel(oODataModel);
            this.oDialog.open();
        },

        onDialogCreateBtn: function () {
            if (!Validation.isValidForm.call(this, DIALOG_FIELDS)) {
                MessageToast.show(MESSAGES.STORE_CREATE_ERROR);
                return;
            }

            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);
            oODataModel.submitChanges();
            this.oDialog.close();
        },

        onDialogCancelBtn: function () {
            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);
            const oCtx = this.oDialog.getBindingContext();
            oODataModel.deleteCreatedEntry(oCtx);
            Form.resetFieldsError.call(this, DIALOG_FIELDS);
            this.oDialog.close();
        },

        onLiveChange: function (oEvent) {
            const oControl = oEvent.getSource();
            oControl instanceof sap.m.DatePicker ? Validation.validateDatePicker(oControl) : Validation.validateInput(oControl);
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
        },


    });
});