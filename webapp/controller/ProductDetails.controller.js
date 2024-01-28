/**
 * ProductDetails controller for the SAPUI5 application.
 *
 * @class
 * @constructor
 * @public
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "../util/Constants",
    "../util/Routing",
    "../util/Form",
    "../util/Validation"
], function (
    Controller, JSONModel, DateFormat, Filter, FilterOperator,
    MessageToast, Constants, Routing, Form, Validation
) {
    "use strict";

    return Controller.extend("yauheni.sapryn.controller.ProductDetails", {

        /**
         * Lifecycle hook that is called when the controller is initialized.
         *
         * @public
         */
        onInit: function () {
            Form.registerFields.call(this, [Constants.PRODUCT_DETAILS_VIEW_ID.AUTHOR_INPUT, Constants.PRODUCT_DETAILS_VIEW_ID.RATING_INDICATOR]);

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute(Constants.PRODUCT_DETAILS_ROUTE).attachPatternMatched(this.onPatternMatched, this);
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
            const sProductID = oEvent.getParameter("arguments").ProductID;

            this.oAppViewModel = new JSONModel({
                Author: "",
                Rating: 0,
                Comment: "",
                ProductId: sProductID,
                Currency: "USD",
            });

            this.getView().setModel(this.oAppViewModel, "appView");

            const oODataModel = this.getView().getModel();
            oODataModel.metadataLoaded().then(() => {
                this._onMetadataLoaded(sProductID, oODataModel);
            })
        },

        /**
         * Formats the product status text based on the provided status value.
         *
         * @param {string} sStatus - The product status.
         * @returns {string} - The formatted status text.
         * @public
         */
        formatStatus: function (sStatus) {
            switch (sStatus) {
                case Constants.STATUS_TYPE_OK:
                    return "Ok";
                case Constants.STATUS_TYPE_STORAGE:
                    return "Storage";
                case Constants.STATUS_TYPE_OUT_OF_STOCK:
                    return "Out of stock";
            }
        },

        /**
         * Formats the product status state based on the provided status value.
         *
         * @param {string} sStatus - The product status.
         * @returns {string} - The formatted status state.
         * @public
         */
        formatState: function (sStatus) {
            switch (sStatus) {
                case Constants.STATUS_TYPE_OK:
                    return "Success";
                case Constants.STATUS_TYPE_STORAGE:
                    return "Indication03";
                case Constants.STATUS_TYPE_OUT_OF_STOCK:
                    return "Indication01";
            }
        },

        /**
         * Handles the "Post Comment" button press event.
         *
         * @param {sap.ui.base.Event} oEvent - The button press event.
         * @public
         */
        onPostCommentSend: function (oEvent) {
            const sAuthor = this.oAppViewModel.getProperty("/Author");
            const iRating = this.oAppViewModel.getProperty("/Rating");
            const sText = this.oAppViewModel.getProperty("/Comment");

            if (Validation.validateField(this.byId(Constants.PRODUCT_DETAILS_VIEW_ID.AUTHOR_INPUT)) || !sAuthor) {
                this.byId(Constants.PRODUCT_DETAILS_VIEW_ID.AUTHOR_INPUT).setValueState("Error");
                MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DETAILS_I18N.AUTHOR_REQUIRED_ERROR));
                return;
            }

            if (!iRating || iRating < 1 || iRating > 5) {
                MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DETAILS_I18N.RATING_REQUIRED_ERROR));
                return;
            }

            if (!sText) {
                MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DETAILS_I18N.COMMENT_REQUIRED_ERROR));
                return;
            }

            const oODataModel = this.getView().getModel();

            oODataModel.create(`/${Constants.PRODUCT_COMMENTS_URL_PATH}`,
                {
                    ProductId: this.oAppViewModel.getProperty("/ProductId"),
                    Author: sAuthor,
                    Rating: iRating,
                    Message: sText,
                    Posted: new Date()
                },
                {
                    success: () => this._onCommentSuccess(),
                    error: () => MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DETAILS_I18N.COMMENT_POST_ERROR))
                }
            )
        },

        /**
         * Handles the "Link" press event.
         *
         * @param {sap.ui.base.Event} oEvent - The press event.
         * @public
         */
        onLinkWithoutParamPress: function (oEvent) {
            Routing.onLinkWithoutParamPress.call(this, oEvent.getSource().getProperty("target"));
        },

        /**
         * Handles the "Link to Store Details" press event.
         *
         * @param {sap.ui.base.Event} oEvent - The press event.
         * @public
         */
        onLinkStoreDetailsPress: function (oEvent) {
            Routing.onLinkWithParamsPress.call(this, Constants.STORE_DETAILS_ROUTE, {
                StoreID: this.getView().getBindingContext().getProperty("StoreId")
            });
        },

        /**
         * Handles the "Author Change" event.
         *
         * @param {sap.ui.base.Event} oEvent - The input change event.
         * @public
         */
        onAuthorChange: function (oEvent) {
            const oInput = oEvent.getSource();
            this._validateInput(oInput);
        },

        /**
         * Formats the currency based on the provided value and currency code.
         *
         * @param {string} sValue - The value to format.
         * @param {string} sCurrency - The currency code.
         * @returns {string} - The formatted currency string.
         * @public
         */
        formatCurrency: function (sValue, sCurrency) {
            return parseInt(sValue, 10) + " " + sCurrency;
        },

        /**
         * Validates the input control and sets the value state accordingly.
         *
         * @param {sap.m.Input} oInput - The input control to be validated.
         * @returns {boolean} - True if there is a validation error, false otherwise.
         * @private
         */
        _validateInput: function (oInput) {
            let sValueState = "None";
            let bValidationError = false;
            const oBinding = oInput.getBinding("value");

            try {
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oException) {
                sValueState = "Error";
                bValidationError = true;
            }

            oInput.setValueState(sValueState);

            return bValidationError;
        },

        /**
         * Handles the success event after posting a comment.
         *
         * @private
         */
        _onCommentSuccess: function () {
            MessageToast.show(this.i18nModel.getProperty(Constants.PRODUCT_DETAILS_I18N.COMMENT_POST_SUCCESS));

            this.byId(Constants.PRODUCT_DETAILS_VIEW_ID.COMMENTS_LIST).getBinding("items").refresh();
            this.oAppViewModel.setProperty("/Author", "");
            this.oAppViewModel.setProperty("/Rating", 0);
            this.oAppViewModel.setProperty("/Comment", "");

            this.byId(Constants.PRODUCT_DETAILS_VIEW_ID.AUTHOR_INPUT).setValue("");
            this.byId(Constants.PRODUCT_DETAILS_VIEW_ID.RATING_INDICATOR).setValue(0);
        },

        /**
         * Handles the metadata loaded event.
         *
         * @param {string} sProductID - The ID of the product.
         * @param {sap.ui.model.odata.v2.ODataModel} oODataModel - The OData model.
         * @private
         */
        _onMetadataLoaded: function (sProductID, oODataModel) {
            const sProductPath = oODataModel.createKey(`/${Constants.PRODUCTS_URL_PATH}`, {id: sProductID});

            this.getView().bindObject({
                path: sProductPath,
            });

            const oFilter = new Filter("ProductId", FilterOperator.EQ, sProductID);

            const sCommentsPath = `/${Constants.PRODUCT_COMMENTS_URL_PATH}`;
            this.byId(Constants.PRODUCT_DETAILS_VIEW_ID.COMMENTS_LIST).bindObject({
                path: sCommentsPath,
            });

            this.byId(Constants.PRODUCT_DETAILS_VIEW_ID.COMMENTS_LIST).getBinding("items").filter(oFilter);
        },
    });
});