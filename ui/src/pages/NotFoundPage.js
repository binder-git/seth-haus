import { jsx as _jsx } from "react/jsx-runtime";
import { ProdErrorPage } from '../components/ProdErrorPage';
export default function NotFoundPage() {
    return _jsx(ProdErrorPage, { text: "Page not found.", canRefresh: false });
}
