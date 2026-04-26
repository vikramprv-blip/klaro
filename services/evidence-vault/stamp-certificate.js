import "dotenv/config";
import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const inputPdf = process.argv[2];
const outputPdf = process.argv[3];
const advocateName = process.argv[4] || "Advocate Name";
const enrollmentNo = process.argv[5] || "Enrollment No.";

if (!inputPdf || !outputPdf) {
  console.error("Usage: node stamp-certificate.js <inputPdf> <outputPdf> [advocateName] [enrollmentNo]");
  process.exit(1);
}

const pdfBytes = fs.readFileSync(inputPdf);
const pdfDoc = await PDFDocument.load(pdfBytes);
const pages = pdfDoc.getPages();
const lastPage = pages[pages.length - 1];

const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

lastPage.drawRectangle({
  x: 330,
  y: 80,
  width: 190,
  height: 90,
  borderColor: rgb(0, 0, 0),
  borderWidth: 1
});

lastPage.drawText("ADVOCATE STAMP", {
  x: 360,
  y: 145,
  size: 10,
  font,
  color: rgb(0, 0, 0)
});

lastPage.drawText(advocateName, {
  x: 345,
  y: 125,
  size: 9,
  font: regular
});

lastPage.drawText(enrollmentNo, {
  x: 345,
  y: 110,
  size: 9,
  font: regular
});

lastPage.drawText("Digitally prepared by Klaro Evidence Vault", {
  x: 345,
  y: 95,
  size: 7,
  font: regular
});

lastPage.drawText("Signature: ____________________", {
  x: 60,
  y: 115,
  size: 10,
  font: regular
});

lastPage.drawText("Date: ____________________", {
  x: 60,
  y: 95,
  size: 10,
  font: regular
});

const stampedBytes = await pdfDoc.save();
fs.writeFileSync(outputPdf, stampedBytes);

console.log("Stamped certificate generated:", outputPdf);
