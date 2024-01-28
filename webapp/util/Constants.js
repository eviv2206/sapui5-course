sap.ui.define([], function () {
    "use strict";

    return {
        // Models constants
        I18N_MODEL: "i18n",
        ODATA_MODEL: undefined,

        // Routes constants
        PRODUCT_DETAILS_ROUTE: "ProductDetails",
        STORE_DETAILS_ROUTE: "StoreDetails",

        // URL Path constants
        PRODUCTS_URL_PATH: "Products",
        STORES_URL_PATH: "Stores",
        PRODUCT_COMMENTS_URL_PATH: "ProductComments",

        // Status types constants
        STATUS_TYPE_ALL: "",
        STATUS_TYPE_OK: "OK",
        STATUS_TYPE_STORAGE: "STORAGE",
        STATUS_TYPE_OUT_OF_STOCK: "OUT_OF_STOCK",

        // Sorters
        SORT_NONE: "",
        SORT_ASC: "ASC",
        SORT_DESC: "DESC",

        // Sort icons
        SORT_NONE_ICON: "sap-icon://sort",
        SORT_ASC_ICON: "sap-icon://sort-ascending",
        SORT_DESC_ICON: "sap-icon://sort-descending",

        // View store list
        STORE_LIST_VIEW_ID: {
            STORES_LIST_VIEW: "StoresList",
        },

        // View store details
        STORE_DETAILS_VIEW_ID: {
            PRODUCT_SEARCH_FIELD: "ProductSearchField",
            PRODUCTS_TABLE: "ProductsTable",
            STORE_LIST: "StoreList",
            FILTER_BAR: "FilterBar",
            FILTER_ALL: "FilterAll",
            FILTER_OK: "FilterOk",
            FILTER_STORAGE: "FilterStorage",
            FILTER_OUT_OF_STOCK: "FilterOutOfStock",
        },

        // View product details
        PRODUCT_DETAILS_VIEW_ID: {
            COMMENTS_LIST: "CommentsList",
            AUTHOR_INPUT: "AuthorInput",
            RATING_INDICATOR: "RatingIndicator",
            COMMENT_INPUT: "CommentInput",
        },

        // View store dialog
        STORE_DIALOG_VIEW_ID: {
            NAME_INPUT: "NameInput",
            EMAIL_INPUT: "EmailInput",
            PHONE_NUMBER_INPUT: "PhoneNumberInput",
            ADDRESS_INPUT: "AddressInput",
            ESTABLISHED_INPUT: "EstablishedInput",
            FLOOR_AREA_INPUT: "FloorAreaInput",
        },

        // View product dialog
        PRODUCT_DIALOG_VIEW_ID: {
            NAME_INPUT: "NameInput",
            PRICE_INPUT: "PriceInput",
            SPECS_INPUT: "SpecsInput",
            RATING_INPUT: "RatingInput",
            SUPPLIER_INFO_INPUT: "SupplierInfoInput",
            MADE_IN_INPUT: "MadeInInput",
            PRODUCTION_COMPANY_NAME_INPUT: "ProductionCompanyNameInput",
            SUBMIT_BTN: "SubmitBtn",
        },

        // Store filter path
        STORE_FILTER_PATH: {
            NAME: "Name",
            ADDRESS: "Address",
            FLOOR_AREA: "FloorArea",
        },

        // Product filter path
        PRODUCT_FILTER_PATH: {
            STATUS: "Status",
            NAME: "Name",
            SPECS: "Specs",
            SUPPLIER_INFO: "SupplierInfo",
            MADE_IN: "MadeIn",
            PRODUCTION_COMPANY_NAME: "ProductionCompanyName",
            PRICE: "Price",
            RATING: "Rating",
            STORE_ID: "StoreId",
        },

        //Store dialog i18n
        STORE_DIALOG_I18N: {
            STORE_DIALOG_TITLE: "StoreDialogTitle",
            CREATE_STORE_SUCCESS_TEXT: "CreateStoreSuccessText",
            CREATE_STORE_FAIL_TEXT: "CreateStoreFailText",
        },

        //Product dialog i18n
        PRODUCT_DIALOG_I18N: {

            CREATE_PRODUCT_SUCCESS_TEXT: "CreateProductSuccessText",
            CREATE_PRODUCT_FAIL_TEXT: "CreateProductFailText",

            PRODUCT_DIALOG_CREATE_TITLE: "ProductDialogCreateTitle",
            CREATE_BTN_TEXT: "CreateBtnText",

            PRODUCT_DIALOG_UPDATE_TITLE: "ProductDialogUpdateTitle",
            UPDATE_PRODUCT_SUCCESS_TEXT: "UpdateProductSuccessText",
            UPDATE_PRODUCT_FAIL_TEXT: "UpdateProductFailText",
            UPDATE_BTN_TEXT: "UpdateBtnText",
        },

        // Message box i18n
        MESSAGE_BOX_I18N: {
            MESSAGE_CONFIRM_TITLE: "MessageConfirmTitle",

            DELETE_STORE_TEXT: "DeleteStoreText",
            DELETE_STORE_SUCCESS_TEXT: "DeleteStoreSuccessText",
            DELETE_STORE_FAIL_TEXT: "DeleteStoreFailText",

            DELETE_PRODUCT_TEXT: "DeleteProductText",
            DELETE_PRODUCT_SUCCESS_TEXT: "DeleteProductSuccessText",
            DELETE_PRODUCT_FAIL_TEXT: "DeleteProductFailText",
        },

        //Product details i18n
        PRODUCT_DETAILS_I18N: {
            AUTHOR_REQUIRED_ERROR: "AuthorRequiredError",
            RATING_REQUIRED_ERROR: "RatingRequiredError",
            COMMENT_REQUIRED_ERROR: "CommentRequiredError",
            COMMENT_POST_ERROR: "CommentPostError",
            COMMENT_POST_SUCCESS: "CommentPostSuccess",
        },

    };
});