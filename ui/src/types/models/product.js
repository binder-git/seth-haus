// Helper functions
export const validateCategory = (category) => {
    const validCategories = ["swim", "bike", "run", "triathlon"];
    return category && validCategories.includes(category)
        ? category
        : "uncategorized";
};
export const validateBrand = (brand) => {
    const validBrands = [
        "BlueSeventy", "HUUB", "Zone3", "Orca",
        "Cervelo", "Canyon", "Specialized", "Trek",
        "HOKA", "Nike", "Asics", "ON",
        "2XU", "Castelli", "Zoot", "TYR"
    ];
    return brand && validBrands.includes(brand)
        ? brand
        : "";
};
