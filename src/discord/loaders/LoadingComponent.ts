import DataPoint from "../../filesystem/DataPoint";
import { DocumentationLinker } from "./JsonLinker";

export default abstract class LoadingComponent {
    dp: DataPoint;
    documentationLinker: DocumentationLinker;

    constructor(dp: DataPoint, documentationLinker: DocumentationLinker) {
        this.dp = dp;
        this.documentationLinker = documentationLinker;
    }

    abstract parse(): void;
}
