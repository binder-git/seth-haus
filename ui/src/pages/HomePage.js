import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useOutletContext } from "react-router-dom";
import { TriHero } from "components/TriHero";
import { Categories } from "components/Categories";
import FeaturedProducts from "components/FeaturedProducts";
import { ShippingInfo } from "components/ShippingInfo";
const HomePage = () => {
    const { selectedMarket } = useOutletContext();
    return (_jsx("main", { className: "flex-grow", children: _jsxs("section", { children: [_jsx(TriHero, {}), _jsx(Categories, {}), _jsx(FeaturedProducts, {}), _jsx(ShippingInfo, { selectedMarket: selectedMarket })] }) }));
};
export default HomePage;
