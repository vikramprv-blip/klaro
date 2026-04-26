const lawyerName = process.argv[2] || "Lawyer";
const upiId = process.argv[3];
const amount = process.argv[4];
const matterTitle = process.argv[5] || "Legal Matter";

if (!upiId || !amount) {
  console.error("Usage: node generate-upi-invoice.js <lawyerName> <upiId> <amount> <matterTitle>");
  process.exit(1);
}

const note = `Professional fees for ${matterTitle}`;
const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(lawyerName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;

console.log("UPI invoice link:");
console.log(upiUrl);
