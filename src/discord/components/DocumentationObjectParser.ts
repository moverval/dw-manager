import DocumentationObject from "../abstract/DocumentationObject";
import StringLinker from "../loaders/StringLinker";
import LoadingComponent from "../loaders/LoadingComponent";

export default class DocumentationObjectParser extends LoadingComponent {
    parse() {
        for(const documentationName in this.documentationLinker.value) {
            if(this.documentationLinker.value[documentationName]) {
                this.callParse(this.documentationLinker.value[documentationName]);
            }
        }
    }

    private callParse(documentationObject: DocumentationObject) {
        this.childParse(documentationObject);
        documentationObject.childreen.forEach(child => this.callParse(child));
    }

    private childParse(documentationObject: DocumentationObject) {
        if(documentationObject.description.startsWith("#file: ")) {
            const linker = new StringLinker(this.dp.parse(documentationObject.description.substr("#file: ".length)));
            if(linker.sourceVisible()) {
                linker.load();
                documentationObject.description = linker.value;
            }
        }
        return documentationObject;
    }
}
