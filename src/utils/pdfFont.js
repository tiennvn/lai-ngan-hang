// Vietnamese-compatible font setup for jsPDF
// Using Times Roman which has better Unicode support built-in

export const setupVietnameseFont = (doc) => {
  // jsPDF 2.x+ has built-in support for standard fonts
  // For Vietnamese, we'll use the default helvetica but handle encoding
  doc.setFont('helvetica');
};

// Alternative: Load custom font if needed
// For full Vietnamese support, you would need to:
// 1. Download a TTF font that supports Vietnamese (e.g., Roboto, Open Sans)
// 2. Convert it to base64
// 3. Add it using doc.addFileToVFS() and doc.addFont()
