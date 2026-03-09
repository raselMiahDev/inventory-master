"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferType = exports.TransferPriority = exports.TransferStatus = void 0;
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pending";
    TransferStatus["IN_TRANSIT"] = "in_transit";
    TransferStatus["COMPLETED"] = "completed";
    TransferStatus["CANCELLED"] = "cancelled";
    TransferStatus["REJECTED"] = "rejected";
    TransferStatus["PARTIALLY_COMPLETED"] = "partially_completed";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
var TransferPriority;
(function (TransferPriority) {
    TransferPriority["LOW"] = "low";
    TransferPriority["NORMAL"] = "normal";
    TransferPriority["HIGH"] = "high";
    TransferPriority["URGENT"] = "urgent";
})(TransferPriority || (exports.TransferPriority = TransferPriority = {}));
var TransferType;
(function (TransferType) {
    TransferType["INTER_DEPOT"] = "inter_depot";
    TransferType["RETURN"] = "return";
    TransferType["REPLENISHMENT"] = "replenishment";
    TransferType["EMERGENCY"] = "emergency";
})(TransferType || (exports.TransferType = TransferType = {}));
