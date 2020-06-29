/**
 * @name DocumentationObject
 *
 * @description
 * The DocumentationObject is a child object for ParentObject.
 * This object can be used recursively by defining the childreen key.
 *
 * @example
 * {
 *  title: "Title",
 *  description: "Description for Title",
 *  childreen: [
 *      {
 *          title: "Title2",
 *          description: "Description for Title2"
 *      }: DocumentationObject
 *  ]
 * }: DocumentationObject
 */
export default interface DocumentationObject {
    title: string;
    nav: string;
    description: string;
    childreen: DocumentationObject[];
}

/**
 * @name ParentObject
 *
 * @description
 * The Documentation ParentObject that is mainly used in the Command class.
 * It can be extended by adding documentation objects to the childreen key.
 *
 * @example
 * {
 *  description: "Description for Object",
 *  childreen: [
 *      {..}: DocumentationObject
 *  ]
 * }
 */
export interface ParentObject {
    description: string;
    childreen?: DocumentationObject[];
}
