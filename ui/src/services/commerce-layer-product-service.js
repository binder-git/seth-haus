const API_BASE_URL = '/api';
export const fetchProducts = async ({ market, category, page = 1, perPage = 20, }) => {
    const params = new URLSearchParams({
        market,
        ...(category && { category }),
        page: page.toString(),
        per_page: perPage.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch products. Please try again.');
    }
    return response.json();
};
export const fetchProductByCode = async (code) => {
    const response = await fetch(`${API_BASE_URL}/products/${code}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to fetch product ${code}. Please try again.`);
    }
    const data = await response.json();
    return data.data;
};
