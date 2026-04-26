export function generate65BCertificate({
  lawyerName,
  firmName,
  clientName,
  matterTitle,
  originalFilename,
  fileHash,
  uploadedAt
}) {
  return `
DRAFT CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT

I, ${lawyerName || "________________"}, representing ${firmName || "________________"}, hereby certify that the electronic record described below was produced from a computer system regularly used for lawful professional purposes.

Matter:
${matterTitle || "________________"}

Client:
${clientName || "________________"}

Electronic Record:
${originalFilename || "________________"}

Hash Algorithm:
SHA-256

File Hash:
${fileHash || "________________"}

Date and Time of Upload:
${uploadedAt || new Date().toISOString()}

I further state that the electronic record was stored in the ordinary course of professional activity, that the computer system was operating properly at the relevant time, and that the integrity of the file has been verified through the hash value recorded above.

This certificate is generated as a draft and should be reviewed, signed, and finalized by the responsible legal professional before filing or submission.

Name:
________________

Designation:
________________

Signature:
________________

Date:
________________
`;
}
