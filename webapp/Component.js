sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, ODataModel, JSONModel) {
    "use strict";

    return UIComponent.extend("yauheni.sapryn.Component", {
        metadata: {
            manifest: "json"
        },

        init : function () {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            const oModel = new JSONModel();
            oModel.setData({
                StoreID: "",
                ProductId: "",
            });

            this.setModel(oModel, "selectedIds");

            this.getRouter().initialize();
        }
    });
});