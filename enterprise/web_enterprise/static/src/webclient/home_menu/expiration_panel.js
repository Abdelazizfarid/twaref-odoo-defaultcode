/** @odoo-module **/
import { useService } from "@web/core/utils/hooks";
import { Transition } from "@web/core/transition";
import { sprintf } from "@web/core/utils/strings";

import { Component, useState, useRef } from "@odoo/owl";

const { DateTime } = luxon;

/**
 * Expiration panel
 *
 * Component representing the banner located on top of the home menu. Its purpose
 * is to display the expiration state of the current database and to help the
 * user to buy/renew its subscription.
 * @extends Component
 */
export class ExpirationPanel extends Component {
    setup() {
        this.subscription = useState(useService("enterprise_subscription"));
        this.cookie = useService("cookie");

        this.state = useState({
            displayRegisterForm: false,
        });

        this.inputRef = useRef("input");
    }

    get buttonText() {
        const { _t } = this.env;
        return this.subscription.lastRequestStatus === "error" ? _t("Retry") : _t("Register");
    }

    get alertType() {
        if (this.subscription.lastRequestStatus === "success") {
            return "success";
        }
        const { daysLeft } = this.subscription;
        if (daysLeft <= 6) {
            return "danger";
        } else if (daysLeft <= 16) {
            return "warning";
        }
        return "info";
    }

    get expirationMessage() {
        const { _t } = this.env;
        const { daysLeft } = this.subscription;
        if (daysLeft <= 0) {
            return _t("This database has expired. ");
        }
        const delay = daysLeft === 30 ? _t("1 month") : sprintf(_t("%s days"), daysLeft);
        if (this.subscription.expirationReason === "demo") {
            return sprintf(_t("This demo database will expire in %s. "), delay);
        }

        const expirationDate = this.subscription.expirationDate;
        const today = DateTime.now();
        const diff = expirationDate.diff(today);

        if (this.subscription.expirationReason !== 'renewal') {
            return sprintf(_t("This database will expire in %s. "), delay);
        } else {
            if (daysLeft > 15) {
                return sprintf(
                    _t("Your subscription expires in %s days. "),
                    daysLeft - 15
                );
            } else {
                return sprintf(
                    _t("Your subscription expired %s days ago. This database will be blocked soon. "),
                    (diff.as("days") | 0)
                );
            }
        }
    }

    showRegistrationForm() {
        this.state.displayRegisterForm = !this.state.displayRegisterForm;
    }

    async onCodeSubmit() {
        const { _t } = this.env;
        const enterpriseCode = this.inputRef.el.value;
        if (!enterpriseCode) {
            return;
        }
        await this.subscription.submitCode(enterpriseCode);
        if (this.subscription.lastRequestStatus === "success") {
            this.state.displayRegisterForm = false;
        } else {
            this.state.buttonText = _t("Retry");
        }
    }
}

ExpirationPanel.template = "DatabaseExpirationPanel";
ExpirationPanel.components = { Transition };
