export enum InvoiceStatus {
  PENDING = 'PENDING',   // bill created but not paid yet
  PARTIAL = 'PARTIAL',   // partial payment has been made
  PAID = 'PAID',         // full bill has been paid
  OVERDUE = 'OVERDUE',   // payment deadline has passed
}