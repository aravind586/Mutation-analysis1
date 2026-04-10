// utils/coloring-utils.jsx

/**
 * Returns the Tailwind text color class for a nucleotide base.
 * @param {string} nucleotide - The nucleotide character (A, T, G, C).
 * @returns {string} Tailwind CSS text color class.
 */
export function getNucleotideColorClass(nucleotide) {
  switch (nucleotide.toUpperCase()) {
    case "A":
      return "text-red-600";
    case "T":
      return "text-blue-600";
    case "G":
      return "text-green-600";
    case "C":
      return "text-amber-600";
    default:
      return "text-gray-500";
  }
}

/**
 * Returns Tailwind background and text color classes based on classification string.
 * @param {string} classification - Classification label.
 * @returns {string} Tailwind CSS background and text color classes.
 */
export function getClassificationColorClasses(classification) {
  if (!classification) return "bg-yellow-100 text-yellow-800";
  const lowercaseClass = classification.toLowerCase();

  if (lowercaseClass.includes("pathogenic")) {
    return "bg-red-100 text-red-800";
  } else if (lowercaseClass.includes("benign")) {
    return "bg-green-100 text-green-800";
  } else {
    return "bg-yellow-100 text-yellow-800";
  }
}
