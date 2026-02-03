export enum AttributeSection {
    COMMON = 'COMMON',
    MANUFACTURING = 'MANUFACTURING',
    MORE_ATTRIBUTES = 'MORE_ATTRIBUTES',
}

export const ATTRIBUTE_SECTIONS = [
    { id: AttributeSection.COMMON, label: 'Common Attributes' },
    { id: AttributeSection.MANUFACTURING, label: 'Manufacturing Info' },
    { id: AttributeSection.MORE_ATTRIBUTES, label: 'More Attributes' },
];

export interface AssetAttributeDefinition {
    id?: number;
    name: string;
    dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN';
    required: boolean;
    section: AttributeSection;
    assetTypeId?: number;
}
