import jsPDF from "jspdf";
import QRCode from "qrcode";

export const generateOrderPDF = async (order) => {
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();

  // =========================
  // HEADER
  // =========================

  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");

  pdf.text(
    "CANTEENX",
    pageWidth / 2,
    20,
    { align: "center" }
  );

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    "Smart Canteen Ordering",
    pageWidth / 2,
    27,
    { align: "center" }
  );

  // Divider

  pdf.line(15, 33, pageWidth - 15, 33);

  // =========================
  // ORDER CONFIRMED
  // =========================

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");

  pdf.text(
    "ORDER CONFIRMED",
    pageWidth / 2,
    45,
    { align: "center" }
  );

  // =========================
  // TOKEN
  // =========================

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    "PICKUP TOKEN",
    pageWidth / 2,
    58,
    { align: "center" }
  );

  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");

  pdf.text(
    `#${order.orderNumber}`,
    pageWidth / 2,
    72,
    { align: "center" }
  );

  // =========================
  // ORDER DETAILS
  // =========================

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");

  let y = 90;

  pdf.text(`Order ID: ${order.orderId}`, 20, y);

  y += 8;

  pdf.text(`Student: ${order.name}`, 20, y);

  y += 8;

  pdf.text(`Department: ${order.department}`, 20, y);

  y += 8;

  pdf.text(`Pickup: ${order.pickupTime}`, 20, y);

  y += 8;

  pdf.text(`Date: ${order.date}`, 20, y);

  // =========================
  // ITEMS
  // =========================

  y += 15;

  pdf.setFont("helvetica", "bold");

  pdf.text("ITEM", 20, y);
  pdf.text("QTY", 125, y);
  pdf.text("PRICE", 160, y);

  pdf.line(15, y + 4, pageWidth - 15, y + 4);

  y += 12;

  pdf.setFont("helvetica", "normal");

  order.items.forEach((item) => {

    pdf.text(item.name, 20, y);

    pdf.text(
      String(item.quantity),
      127,
      y
    );

    pdf.text(
      `Rs.${item.price * item.quantity}`,
      160,
      y
    );

    y += 9;
  });

  // =========================
  // TOTAL
  // =========================

  y += 5;

  pdf.line(15, y, pageWidth - 15, y);

  y += 12;

  pdf.setFont("helvetica", "bold");

  pdf.text("TOTAL", 20, y);

  pdf.text(
    `Rs.${order.totalPrice}`,
    160,
    y
  );

  // =========================
  // QR CODE
  // =========================

  y += 15;

  const qrData = JSON.stringify({
    orderId: order.orderId,
    token: order.orderNumber,
  });

  try {

    const qrCode = await QRCode.toDataURL(qrData);

    pdf.addImage(
      qrCode,
      "PNG",
      pageWidth / 2 - 25,
      y,
      50,
      50
    );

  } catch (error) {

    console.error(
      "QR generation failed:",
      error
    );

  }

  y += 58;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    "Show this QR code or token at the pickup counter.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 10;

  pdf.text(
    "Estimated preparation time: 5–10 minutes",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // =========================
  // FOOTER
  // =========================

  pdf.setFontSize(8);

  pdf.text(
    "Thank you for ordering with canteenX!",
    pageWidth / 2,
    285,
    { align: "center" }
  );

  // =========================
  // DOWNLOAD
  // =========================

  pdf.save(
    `canteenX-Order-${order.orderNumber}.pdf`
  );
};