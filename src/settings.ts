import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import powerbi from "powerbi-visuals-api";import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import IEnumMember = powerbi.IEnumMember;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import Card = formattingSettings.SimpleCard;
import Model = formattingSettings.Model;
import Slice = formattingSettings.Slice;
import ColorPicker = formattingSettings.ColorPicker;
import ToggleSwitch = formattingSettings.ToggleSwitch;
import NumUpDown = formattingSettings.NumUpDown;
import TextInput = formattingSettings.TextInput;
import AutoDropdown = formattingSettings.AutoDropdown;
import FontControl = formattingSettings.FontControl;
import FontPicker = formattingSettings.FontPicker;
// Definizione delle opzioni per la ricerca
const searchOptions: IEnumMember[] = [
    { displayName: "Visual_Search_Font_Color", value: "Font Color" },
];

export class VisualSettings extends dataViewObjectsParser.DataViewObjectsParser {
    public general: GeneralSettings = new GeneralSettings();
    public chips: ChipSettings = new ChipSettings();
    public scrollbar: ScrollbarSettings = new ScrollbarSettings();
    public search: SearchSettings = new SearchSettings();
    public tooltip: TooltipSettings = new TooltipSettings();
}

// Impostazioni generali
export class GeneralSettings {
    public selectAll: boolean = false;
    public fontColor: string = "#000000";
    public listColor: string = "#000000";
    public textBold: boolean = false;
    public textItalic: boolean = false;
    public textUnderline: boolean = false;
    public fontFamily: string = "Arial";
    public fontSize: number = 12;
    public backgroundColor: string = "transparent";
    public borderColor: string = "transparent";
    public hoverColor: string = "#d3d3d3";
    public hoverLabelColor: string = "#000000";
    public boxShadowColor: string = "transparent";
    public boxShadowOffset: string = "Esterno";
    public borderWidth: number = 1;
    public borderRadius: number = 1;
    public padding: number = 2;
    public arrowSize: number = 12;
    public arrowPosition: number = 20;
    public arrowColor: string = "#000000";
    public arrowShape: string = "▼"; // Default arrow shape
    public checkboxBorderColor: string = "blue"; // Colore bordo
    public checkboxBorderWidth: number = 1; // Larghezza bordo
    public checkboxCheckedColor: string = "#0000ff";

    static enumerateObjectInstances(settings: GeneralSettings, options: powerbi.EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        const instances: powerbi.VisualObjectInstance[] = [];

        if (options.objectName === 'general') {
            instances.push({
                objectName: 'general',
                properties: {
                    fontColor: settings.fontColor,
                    listColor: settings.listColor,
                    backgroundColor: settings.backgroundColor,
                    fontSize: settings.fontSize,
                    fontFamily: settings.fontFamily,
                    borderColor: settings.borderColor,
                    borderWidth: settings.borderWidth,
                    borderRadius: settings.borderRadius,
                    padding: settings.padding,
                    arrowPosition: settings.arrowPosition,
                    arrowColor: settings.arrowColor,
                    arrowSize: settings.arrowSize,
                    boxShadowColor: settings.boxShadowColor,
                    boxShadowOffset: settings.boxShadowOffset,
                    arrowShape: settings.arrowShape,
                    hoverLabelColor: settings.hoverLabelColor,
                    hoverColor: settings.hoverColor,
                    checkboxBorderColor: settings.checkboxBorderColor,
                    checkboxBorderWidth: settings.checkboxBorderWidth,
                    checkboxCheckedColor: settings.checkboxCheckedColor
                },
                selector: null
            });
        }

        return instances;
    }

    public static setLocalizedOptions(localizationManager: ILocalizationManager) {
        // Imposta le opzioni localizzate qui
        const localizedStrings = {
            fontColor: localizationManager.getDisplayName("Font Color"),
            listColor: localizationManager.getDisplayName("List Color"),
            backgroundColor: localizationManager.getDisplayName("Background Color"),
            fontSize: localizationManager.getDisplayName("Font Size"),
            fontFamily: localizationManager.getDisplayName("Font Family"),
            borderColor: localizationManager.getDisplayName("Border Color"),
            borderWidth: localizationManager.getDisplayName("Border Width"),
            borderRadius: localizationManager.getDisplayName("Border Radius"),
            padding: localizationManager.getDisplayName("Padding"),
            arrowPosition: localizationManager.getDisplayName("Arrow Position"),
            arrowColor: localizationManager.getDisplayName("Arrow Color"),
            arrowSize: localizationManager.getDisplayName("Arrow Size"),
            boxShadowColor: localizationManager.getDisplayName("Box Shadow Color"),
            boxShadowOffset: localizationManager.getDisplayName("Box Shadow Offset"),
            arrowShape: localizationManager.getDisplayName("Arrow Shape"),
            hoverLabelColor: localizationManager.getDisplayName("Hover Label Color"),
            hoverColor: localizationManager.getDisplayName("Hover Color"),
            checkboxBorderColor: localizationManager.getDisplayName("Checkbox Border Color"),
            checkboxBorderWidth: localizationManager.getDisplayName("Checkbox Border Width"),
            checkboxCheckedColor: localizationManager.getDisplayName("Checkbox Checked Color")
        };
    }}

// Nuova classe per le impostazioni delle chips
export class ChipSettings {
    public chipColor: string = "#f0f0f0"; // Colore di sfondo della chip
    public chipBorderColor: string = "#ccc"; // Colore del bordo della chip
    public chipTextColor: string = "#333"; // Colore del testo della chip
    public chipBorderRadius: number = 15; // Raggio del bordo della chip
    public chipFontSize: number = 9;
    public chipRemoveColor: string = "#ff0000";
    public chipBorderWidth: string = "#ff0000";
    public fontFamily: string = "Arial";
    public chipInternbg: string = "#fffff";
    public textBold: boolean = false; public textItalic: boolean = false;
    public textUnderline: boolean = false;
    static enumerateObjectInstances(settings: ChipSettings, options: powerbi.EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        const instances: powerbi.VisualObjectInstance[] = [];

        if (options.objectName === 'chips') {
            instances.push({
                objectName: 'chips',
                properties: {
                    chipColor: settings.chipColor,
                    chipInternbg: settings.chipInternbg,
                    chipBorderColor: settings.chipBorderColor,
                    chipTextColor: settings.chipTextColor,
                    chipBorderRadius: settings.chipBorderRadius,
                    chipFontSize: settings.chipFontSize,
                    chipRemoveColor: settings.chipRemoveColor
                },
                selector: null
            });
        }

        return instances;
    }
    public static setLocalizedOptions(localizationManager: ILocalizationManager) {
        const localizedStrings = {
            chipColor: localizationManager.getDisplayName("Chip Color"),
            chipInternbg: localizationManager.getDisplayName("Chip Internbg"),
            chipBorderColor: localizationManager.getDisplayName("Chip Border Color"),
            chipTextColor: localizationManager.getDisplayName("Chip Text Color"),
            chipBorderRadius: localizationManager.getDisplayName("Chip Border Radius"),
            chipFontSize: localizationManager.getDisplayName("Chip Font Size"),
            chipRemoveColor: localizationManager.getDisplayName("Chip Remove Color"),
        };
    }
}

// Nuova classe per le impostazioni della scrollbar
export class ScrollbarSettings {
    public scrollbarColor: string = "#cccccc"; // Colore della barra di scorrimento
    public scrollbarWidth: number =8; // Larghezza della barra
    public scrollbarRadius:number=8;
    public scrollbarThumbColor: string = "#888888"; // Colore del "thumb" della barra
    public scrollbarThumbHoverColor: string = "pink"; // Colore del thumb quando il mouse è sopra
    public scrollbarTrackColor: string = "transparent"; // Colore del track (sfondo della barra)
    public scrollbarThumbColorArrow:string="transparent";
    static enumerateObjectInstances(settings: ScrollbarSettings, options: powerbi.EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        const instances: powerbi.VisualObjectInstance[] = [];

        if (options.objectName === 'scrollbar') {
            instances.push({
                objectName: 'scrollbar',
                properties: {
                    scrollbarColor: settings.scrollbarColor,
                    scrollbarWidth: settings.scrollbarWidth,
                    scrollbarThumbColor: settings.scrollbarThumbColor,
                    scrollbarThumbHoverColor: settings.scrollbarThumbHoverColor,
                    scrollbarTrackColor: settings.scrollbarTrackColor,
                    
                },
                selector: null
            });
        }

        return instances;
    }
    public static setLocalizedOptions(localizationManager: ILocalizationManager) {
        // Imposta le opzioni localizzate qui
        const localizedStrings = {
            scrollbarThumbColor: localizationManager.getDisplayName("Scrollbar Thumb Color"),
          
        };
    }
}


class TooltipSettings{ public Color: string = "#f0f0f0"; // Colore di sfondo della chip
    public BorderColor: string = "#ccc"; // Colore del bordo della chip
    public TextColor: string = "#333"; // Colore del testo della chip
    public BorderRadius: number = 15; // Raggio del bordo della chip
    public FontSize: number =9; static enumerateObjectInstances(settings: TooltipSettings, options: powerbi.EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        const instances: powerbi.VisualObjectInstance[] = [];

        if (options.objectName === 'Tooltip') {
            instances.push({
                objectName: 'Tooltip',
                properties: {
                    BorderColor: settings.BorderColor,
                    TextColor: settings.TextColor,
                    BorderRadius: settings.BorderRadius,
                    FontSize: settings.FontSize,
         
                },
                selector: null
            });
        }

        return instances;
    }
}

class SearchSettings extends Card {
    addSelection = new ToggleSwitch({
        name: "addSelection",
        displayName: undefined,
        value: false,
    });
    public fontColor: string = ""; // "#808080";
    public borderColor: string = ""; // "#666666";
    public lineColor: string = ""; // "#C8C8C8"
    public background: string = "";
    public fontFamily: string = "Arial";
    public textSize: number = 10;
  
 
    static enumerateObjectInstances(settings: SearchSettings , options: powerbi.EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
        const instances: powerbi.VisualObjectInstance[] = [];

        if (options.objectName === 'search') {
            instances.push({
                objectName: 'search',
                properties: {
                    addSelection: settings.addSelection,
                    fontColor: settings.fontColor,
                    iconColor: settings. borderColor,
                    lineColor: settings.lineColor,
                    background: settings.background,
                    fontFamily: settings.fontFamily,
                    textSize:settings.textSize,
                  
                },
                selector: null
            });
        }

        return instances;
    }
}