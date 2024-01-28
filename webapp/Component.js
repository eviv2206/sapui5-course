/**
 * SAPUI5 Component for the application.
 *
 * @class
 * @constructor
 * @public
 * @extends sap.ui.core.UIComponent
 */
sap.ui.define([
    "sap/ui/core/UIComponent",
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("yauheni.sapryn.Component", {
        metadata: {
            manifest: "json"
        },

        /**
         * Initialization of the component.
         *
         * @override
         * @public
         */
        init: function () {
            // Call the base class init method
            UIComponent.prototype.init.apply(this, arguments);

            // Initialize the router
            this.getRouter().initialize();
        }
    });
});