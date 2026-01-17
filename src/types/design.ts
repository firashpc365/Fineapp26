export type CoreType = 'JAG' | 'ELITEPRO' | 'SITE' | 'RIGHT';

export interface QuotationTheme {
    core: CoreType;
    branding: {
        primaryColor: string;
        logoPosition: 'left' | 'center' | 'right';
        logoSize: number;
    };
    typography: {
        fontFamily: string;
    };
    layout: {
        headerStyle: 'standard' | 'block';
        showWatermark: boolean;
        watermarkText: string;
    };
    footer: {
        customTerms: string;
        showSignature: boolean;
    };
}