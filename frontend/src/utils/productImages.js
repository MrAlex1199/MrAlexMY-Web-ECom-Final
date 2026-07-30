// Helper to return clean product image URLs and fallback for broken 404 links
export const getProductImage = (product) => {
  if (!product) return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";

  const img = product.imageSrc || "";
  // Check if image is missing or is the dead TailwindUI plus-assets link that returns a red 404 graphic
  if (!img || img.includes("tailwindui.com/plus-assets") || img.includes("tailwindui.com/img")) {
    const name = (product.name || "").toLowerCase();
    const cat = (product.breadcrumbs || "").toLowerCase();

    if (name.includes("jean") || name.includes("pant")) {
      return "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("dress") || name.includes("jumpsuit") || cat.includes("women")) {
      return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("sweatshirt") || name.includes("hoodie") || name.includes("flannel")) {
      return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("jacket") || name.includes("coat")) {
      return "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";
  }

  return img;
};
