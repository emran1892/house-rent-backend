export enum PaymentStatus {
  SUBMITTED = 'SUBMITTED', // tenant has submitted and send the ref
  APPROVED = 'APPROVED',   // landlord has approved and added the payment to the invoice
  REJECTED = 'REJECTED',   // fraudulent or incorrect payment rejected
}