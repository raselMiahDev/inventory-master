"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleStatus = exports.TransactionType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["IN_CHARGE"] = "in_charge";
})(UserRole || (exports.UserRole = UserRole = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["RECEIVE"] = "receive";
    TransactionType["SALE"] = "sale";
    TransactionType["TRANSFER_OUT"] = "transfer_out";
    TransactionType["TRANSFER_IN"] = "transfer_in";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var SaleStatus;
(function (SaleStatus) {
    SaleStatus["PENDING"] = "pending";
    SaleStatus["DEPOSITED"] = "deposited";
})(SaleStatus || (exports.SaleStatus = SaleStatus = {}));
