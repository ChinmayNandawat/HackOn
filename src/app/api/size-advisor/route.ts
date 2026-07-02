import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, selectedSize } = body;

    if (!product || !selectedSize) {
      return NextResponse.json(
        { error: "Product and selectedSize are required" },
        { status: 400 }
      );
    }

    const title = product.title?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    
    let recommendedSize = "M"; // Default fallback
    let reasonText = "Most buyers recommend sizing up for a better fit.";

    // Size progression helper
    const sizeUp = (size: string) => {
      const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
      const idx = sizes.indexOf(size.toUpperCase());
      return idx >= 0 && idx < sizes.length - 1 ? sizes[idx + 1] : size;
    };

    // Determine logic based on keywords
    if (title.includes("shoe") || title.includes("sneaker") || title.includes("boot") || category.includes("footwear") || category === "shoes") {
      recommendedSize = sizeUp(selectedSize);
      reasonText = "⚠️ This item runs small. Buy 1 size larger than your usual size.";
    } else if (title.includes("shirt") || title.includes("jacket") || title.includes("hoodie") || category.includes("tops")) {
      recommendedSize = sizeUp(selectedSize);
      reasonText = "⚠️ This item has a slim fit. Buy 1 size larger than your usual size.";
    } else if (title.includes("jeans") || title.includes("pants") || category.includes("bottoms")) {
      recommendedSize = sizeUp(selectedSize);
      reasonText = "⚠️ This item runs tight at the waist. Buy 1 size larger than your usual size.";
    } else {
      recommendedSize = sizeUp(selectedSize);
      reasonText = "⚠️ Based on reviews, buy 1 size larger than your usual size.";
    }

    return NextResponse.json({
      recommendedSize,
      reasonText
    });
  } catch (error) {
    console.error("Size advisor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
