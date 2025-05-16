import { jsx as _jsx } from "react/jsx-runtime";
import { ProdErrorPage } from '../components/ProdErrorPage';
export default function SomethingWentWrongPage() {
    return _jsx(ProdErrorPage, { text: "Something went wrong.", canRefresh: true });
}
