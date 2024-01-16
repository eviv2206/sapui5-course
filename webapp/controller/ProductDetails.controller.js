sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/ValidateException",
    "sap/ui/core/Core",
    "../Constants"
], function (Controller, JSONModel, DateFormat, Filter, FilterOperator, MessageToast, ValidationException, Core, Constants) {
    "use strict";

    const VIEW_ID = {
        COMMENTS_LIST: "CommentsList",
        AUTHOR_INPUT: "AuthorInput",
        RATING_INDICATOR: "RatingIndicator",
        COMMENT_INPUT: "CommentInput",
    };

    const MESSAGES = {
        AUTHOR_REQUIRED: "Author name is required.",
        RATING_REQUIRED: "Rating is required. From 1 to 5.",
        COMMENT_REQUIRED: "Comment is required.",
        COMMENT_POST_SUCCESS: "Comment posted successfully!",
        COMMENT_POST_ERROR: "Failed to post comment.",
    }

    return Controller.extend("yauheni.sapryn.controller.ProductDetails", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            const oCurrentRoute = oRouter.getHashChanger().getHash();
            const oParameters = oRouter.getRouteInfoByHash(oCurrentRoute);

            this.getOwnerComponent().getModel(Constants.SELECTED_IDS_MODEL).setProperty("/StoreID", oParameters.arguments.StoreID);
            this.getOwnerComponent().getModel(Constants.SELECTED_IDS_MODEL).setProperty("/ProductID", oParameters.arguments.ProductID);

            this.oAppViewModel = new JSONModel({
                Author: "",
                Rating: 0,
                Comment: "",
                ProductId: oParameters.arguments.ProductID,
            });

            this.getView().setModel(this.oAppViewModel, "appView");

            const oMessageManager = Core.getMessageManager();

            oMessageManager.registerObject(this.byId(VIEW_ID.AUTHOR_INPUT), true);
            oMessageManager.registerObject(this.byId(VIEW_ID.RATING_INDICATOR), true);

            oRouter.getRoute(Constants.PRODUCT_DETAILS_ROUTE).attachPatternMatched(this.onPatternMatched, this);
        },

        OnAfterRendering: function () {

        },

        onPatternMatched: function (oEvent) {
            const mRouteArguments = oEvent.getParameter("arguments");
            const sProductID = mRouteArguments.ProductID;
            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);

            oODataModel.metadataLoaded().then(() => {
                const sProductPath = oODataModel.createKey(`/${Constants.PRODUCTS_URL_PATH}`, {id: sProductID});

                this.getView().bindObject({
                    path: sProductPath,
                    model: Constants.ODATA_MODEL,
                });

                const oFilter = new Filter("ProductId", FilterOperator.EQ, sProductID);

                const sCommentsPath = `/${Constants.PRODUCT_COMMENTS_URL_PATH}`;
                this.byId(VIEW_ID.COMMENTS_LIST).bindObject({
                    path: sCommentsPath,
                    model: Constants.ODATA_MODEL,
                });

                this.byId(VIEW_ID.COMMENTS_LIST).getBinding("items").filter(oFilter);

            })
        },

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

        onPostCommentSend: function (oEvent) {
            const sAuthor = this.oAppViewModel.getProperty("/Author");
            const nRating = this.oAppViewModel.getProperty("/Rating");
            const sText = this.oAppViewModel.getProperty("/Comment");

            if (this._validateInput(this.byId(VIEW_ID.AUTHOR_INPUT)) || !sAuthor) {
                this.byId(VIEW_ID.AUTHOR_INPUT).setValueState("Error");
                MessageToast.show(MESSAGES.AUTHOR_REQUIRED);
                return;
            }

            if (!nRating || nRating < 1 || nRating > 5) {
                MessageToast.show(MESSAGES.RATING_REQUIRED);
                return;
            }

            if (!sText) {
                MessageToast.show(MESSAGES.COMMENT_REQUIRED);
                return;
            }

            const oODataModel = this.getView().getModel(Constants.ODATA_MODEL);

            oODataModel.create(`/${Constants.PRODUCT_COMMENTS_URL_PATH}`,
                {
                    ProductId: this.oAppViewModel.getProperty("/ProductId"),
                    Author: sAuthor,
                    Rating: nRating,
                    Message: sText,
                    Posted: new Date()
                },
                {
                    success: () => this._onCommentSuccess(),
                    error: () => MessageToast.show(MESSAGES.COMMENT_POST_ERROR)
                }
            )
        },

        onLinkWithoutParamPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(oEvent.getSource().getProperty("target"));
        },

        onLinkStoreDetailsPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const sStoreId = this.getView().getModel(Constants.SELECTED_IDS_MODEL).getProperty("/StoreID");
            oRouter.navTo(Constants.STORE_DETAILS_ROUTE, {
                StoreID: sStoreId
            });
        },

        onLinkProductDetailsPress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const sProductId = this.getView().getModel(Constants.SELECTED_IDS_MODEL).getProperty("/ProductID");
            oRouter.navTo(Constants.PRODUCT_DETAILS_ROUTE, {
                ProductID: sProductId
            });
        },

        onAuthorChange: function (oEvent) {
            const oInput = oEvent.getSource();
            this._validateInput(oInput);
        },

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

        _onCommentSuccess: function () {
            MessageToast.show(MESSAGES.COMMENT_POST_SUCCESS);

            this.byId(VIEW_ID.COMMENTS_LIST).getBinding("items").refresh();
            this.oAppViewModel.setProperty("/Author", "");
            this.oAppViewModel.setProperty("/Rating", 0);
            this.oAppViewModel.setProperty("/Comment", "");

            this.byId(VIEW_ID.AUTHOR_INPUT).setValue("");
            this.byId(VIEW_ID.RATING_INDICATOR).setValue(0);
        }
    });
});