/**
 * Formats a numeric price as Indonesian Rupiah.
 * @param price numeric price
 * @returns formatted IDR string
 */
export const formatPrice = (price: number) => {
  return price.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
