sap.ui.define([], function() {
    "use strict";

    return {
        // Models constants
        SELECTED_IDS_MODEL: "selectedIds",
        ODATA_MODEL: "odata",

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

    };
});