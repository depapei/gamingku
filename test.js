import http from "k6/http";

export const options = {
  vus: 100, // jumlah user
  duration: "5s", // lama test
  // stages: [
  //   { duration: "10s", target: 50 },
  //   { duration: "20s", target: 100 },
  //   { duration: "10s", target: 0 },
  // ],
};

export default function () {
  http.get("http://localhost:8080/admin/order/");
  http.get("http://localhost:8080/admin/product/");
  createProduct();
}

export const createProduct = () => {
  return http.post(
    "http://localhost:8080/admin/product/",
    JSON.stringify({
      name: "Noir Spade 65",
      slug: "noir-spade-65",
      price: 1800000,
      discountPrice: 1500000,
      stock: 20,
      categoryId: 4,
      images: [
        "https://www.noirgear.com/cdn/shop/files/PaleGoldenArtboard1_f6c176be-2062-4f15-abb3-d0f3142c1da0.jpg?v=1757302127&width=823",
        "https://www.noirgear.com/cdn/shop/files/ObsidianBlackArtboard1_7ffeb663-e834-4f18-a40b-ffb3f3b05a21.jpg?v=1757302127&width=823",
        "https://www.noirgear.com/cdn/shop/files/PaleGoldenArtboard4.jpg?v=1757302127&width=823",
        "https://www.noirgear.com/cdn/shop/files/ObsidianBlackArtboard3.jpg?v=1757302127&width=823",
        "https://www.noirgear.com/cdn/shop/files/PaleGoldenArtboard5.jpg?v=1757302127&width=823",
        "https://www.noirgear.com/cdn/shop/files/ObsidianBlackArtboard5.jpg?v=1757302127&width=823",
      ],
      rating: 0,
      reviewCount: 0,
      description:
        "Noir Spade65 adalah mechanical keyboard 65% premium dari Noir Gear yang menggunakan casing aluminium 6063 dengan struktur gasket mount, menawarkan pengalaman mengetik solid dan empuk. Keyboard ini menonjol dengan desain artistik, mendukung multi-layout (ANSI/ISO), konektivitas 3-mode (Wired/BT/2.4G), serta dilengkapi carrying case.",
      createdBy: 1,
      featured: false,
      variants: [
        {
          name: "Color",
          options: [
            {
              name: "Pale Golden",
              isAvailable: true,
            },
            {
              name: "Obsidian Black",
              isAvailable: true,
            },
          ],
        },
        {
          name: "Switch",
          options: [
            {
              name: "KTT KU Orange Linear",
              isAvailable: true,
            },
            {
              name: "KTT KU Brown Tactile",
              isAvailable: true,
            },
            {
              name: "Leobog Reaper Tactile",
              isAvailable: true,
            },
          ],
        },
      ],
      specifications: [
        { key: "model", name: "Noir Spade65 QMK/VIA" },
        { key: "material", name: "Aluminum 6063" },
        { key: "connection", name: "Wired, Bluetooth 5.0, Wireless 2.4GHz" },
        { key: "plate", name: "PC" },
        { key: "ixpe switch pad", name: "IXPE Switch Pad" },
        { key: "poron plate foam", name: "Poron Plate Foam" },
        { key: "poron case foam", name: "Poron Case Foam" },
        { key: "pre lubed stabilizer", name: "Pre-lubed Stabilizer" },
        {
          key: "extra layout keycaps",
          name: "Extra ISO layout & split spacebar keycaps",
        },
        { key: "form factor", name: "65%" },
        { key: "layout", name: "ANSI, ISO & Split space bar" },
        { key: "keys", name: "66 Keys" },
        { key: "weight", name: "1355 ±10 gram" },
        { key: "cable", name: "1 Coiled + 1 Straight" },
        { key: "battery capacity", name: "4000 mAh" },
        { key: "keycaps material", name: "PBT Dyesub" },
        { key: "dimension", name: "326 x 114 x 31mm" },
        { key: "configurable", name: "Configurable using QMK/VIA" },
        { key: "compatibility", name: "Compatible with Windows and Mac OS" },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
