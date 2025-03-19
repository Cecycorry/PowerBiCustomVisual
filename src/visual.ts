/* eslint-disable powerbi-visuals/no-implied-inner-html */
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import * as d3 from "d3";
import "./interfaces";
import powerbi from "powerbi-visuals-api";import VisualObjectInstance=powerbi.VisualObjectInstance
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualSettings } from "./settings";
import "../style/visual.less";
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import ISelectionId = powerbi.visuals.ISelectionId;
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { BasicFilter, IBasicFilter, IFilter, IFilterTarget, IHierarchyIdentityFilterNode, IHierarchyIdentityFilterTarget } from "powerbi-models";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;import {  TooltipEventArgs, TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";

import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;

interface IHierarchyIdentityFilter<IdentityType> extends IFilter {
    target: IHierarchyIdentityFilterTarget;
    hierarchyData: IHierarchyIdentityFilterNode<IdentityType>[];
}
export class Visual implements IVisual {
    private target: HTMLElement;private events: IVisualEventService;
    private host: IVisualHost;
    private settings: VisualSettings;
    private searchTerm: string = "";
    private selectionManager: ISelectionManager;
    private dataView: powerbi.DataView;
    private dropdownContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private chipContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private allowInteractions: boolean;
    private selectedIndices: number[] = [];
    private isDropdownOpen: boolean = false;
    private fieldName: string;
    private foregroundColor: string;
private backgroundColor: string;
private foregroundSelectedColor: string;
private hyperlinkColor: string;
private tooltipServiceWrapper: ITooltipServiceWrapper;
    private isHighContrast: boolean;
    private isOpen: boolean = false;
    private chipsContainer: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private dropdown: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private categories: any;
    private locale: string;
    private selectedValues: Set<any> = new Set();
    private localizationManager: ILocalizationManager;
    private formattingSettingsService: FormattingSettingsService;
    colorPalette: any;
    localization: any;
    container: any;
    root: any;
    renderFiltered: null;
    tableView: any;
    dropdownOptions: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    constructor(options: VisualConstructorOptions) {
        this.target = options.element;this.events = options.host.eventService;
        this.host = options.host;
        
        this.locale = options.host.locale;
        this.selectionManager = this.host.createSelectionManager();
        this.allowInteractions = this.host.hostCapabilities.allowInteractions;
        this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
        this.createDropdownContainer();this.handleContextMenu();
        let colorPalette: ISandboxExtendedColorPalette = this.host.colorPalette;
        this.isHighContrast = colorPalette.isHighContrast;
    if (this.isHighContrast) {
        this.foregroundColor = colorPalette.foreground.value;
        this.backgroundColor = colorPalette.background.value;
        this.foregroundSelectedColor = colorPalette.foregroundSelected.value;
        this.hyperlinkColor = colorPalette.hyperlink.value;
    }
    
    this.localizationManager = this.host.createLocalizationManager();
    this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);

    }

    private createDropdownContainer() {
        this.dropdownContainer = d3.select(this.target)
            .append("div")
            .attr("class", "dropdown-multi-checkbox")
            .style("padding", "5px")
            .style("position", "relative");
    
        const button = this.dropdownContainer.append("button")
            .attr("class", "dropdown-button")
            .on("click", () => this.toggleDropdown());
    
        button.append("span")
            .attr("class", "dropdown-label")
            .text(this.fieldName || "");
    
        button.append("span")
            .attr("class", "dropdown-arrow")
            .html("&#9660;");
    
        this.dropdownContainer.append("input")
            .attr("type", "text")
            .attr("class", "search-input")
            .attr("placeholder", "Search...")
            .on("input", () => this.onSearch());
    
        this.chipContainer = this.dropdownContainer.append("div")
            .attr("class", "chip-container");
    
        this.dropdownOptions = this.dropdownContainer.append("div")
            .attr("class", "dropdown-options")
            .style("display", "none")
            .style("height","300px")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.1)")
            .style("z-index", "1000");
    }
    public update(options: VisualUpdateOptions) { 
        this.host.eventService.renderingStarted(options);

        if (!options ||
            !options.dataViews ||
            !options.dataViews.length ||
            !options.dataViews[0]?.categorical?.categories?.length ||
            !options.dataViews[0]?.categorical?.categories[0]?.values?.length ||
            !options.viewport) {

          this.clear
            this.host.eventService.renderingFinished(options);
            return;
        }
        this.events.renderingFinished(options);
        this.dataView = options.dataViews[0];
        this.settings = VisualSettings.parse(options && options.dataViews && options.dataViews[0]);
    
        // Carica i filtri salvati (ripristina i valori selezionati)
        this.restoreSelectedChips(options); // Added semicolon
    
        // Aggiorna i chip e le opzioni del dropdown
        const category = this.dataView.categorical.categories[0];
        const values = category.values;
    
        this.removeChip(options); // Ensure correct placement
        this.updateChips(values); // Aggiorna i chip
        this.updateDropdownOptions(this.getFilteredValues(this.searchTerm)); // Aggiorna le opzioni del dropdown
        this.addClearAllButtonListener();
    
        // Ensure selectedIndices is properly handled
        this.selectedIndices = []; // Initialize or assign as needed
    
        // Imposta il nome del campo
        this.fieldName = category.source.displayName;
    
        // Crea gli ID di selezione per ogni valore
        const selectionIds: ISelectionId[] = values.map((value, index) =>
            this.host.createSelectionIdBuilder()
                .withCategory(category, index)
                .createSelectionId()
        );
    
     
    
        // Gestione della visibilità della barra di ricerca
        if (this.settings.search.addSelection) {
            this.dropdownContainer.select(".search-input").style("display", "block");
        } else {
            this.dropdownContainer.select(".search-input").style("display", "none");
        }
    
        // Mantieni il termine di ricerca e aggiorna il dropdown con i valori filtrati
        const filteredValues = this.searchTerm
            ? this.getFilteredValues(this.searchTerm)
            : values;
    
        this.populateDropdownOptions(filteredValues, selectionIds);
        this.updateChips(values); // Rende visibili le chips dei filtri selezionati
    
    
    
        // Update styles based on settings
        
        this.dropdownContainer.style("color", this.foregroundColor);
        this.dropdownContainer.style("background-color", this.backgroundColor);
        this.dropdownContainer.style("border-color", this.foregroundColor); // Colore del bordo per la visibilità in alto contrasto
        this.dropdownContainer.style("background-color",  this.isHighContrast ? this.backgroundColor : this.settings.general.backgroundColor);
        this.dropdownContainer.style("border-color", "transparent");
this.dropdownContainer.select(".search-input").property("value", this.searchTerm).style("color", this.settings.search.fontColor).style("border-color", this.settings.search.borderColor) .style("background-color", this.settings.search.background);
        this.dropdownContainer.style('font-weight', this.settings.general.textBold ? "bold" : "normal")
        this.dropdownContainer.style("font-style", this.settings.general.textItalic ? "italic" : "normal")
        this.dropdownContainer.style("text-decoration", this.settings.general.textUnderline ? "underline" : "none")
        this.dropdownContainer.style('font-family', this.settings.general.fontFamily)
        this.dropdownContainer.style('font-size', this.settings.general.fontSize + 'px')
        this.dropdownContainer.style('color', this.isHighContrast ? this.foregroundColor : this.settings.general.fontColor);
        this.dropdownContainer.style('background-color', this.isHighContrast ? this.backgroundColor : this.settings.general.backgroundColor);
        this.dropdownContainer.select(".dropdown-arrow").style("color", this.isHighContrast ? this.foregroundColor : this.settings.general.arrowColor).html(this.settings.general.arrowShape);
        this.dropdownContainer.style('border-radius', this.settings.general.borderRadius + 'px')
        this.dropdownContainer.style('padding', this.settings.general.padding + 'px')
        this.dropdownContainer.style('border-width', this.settings.general.borderWidth + 'px')
        this.dropdownContainer.style('border-style', 'solid');
        this.chipContainer.style('font-weight', this.settings.chips.textBold ? "bold" : "normal")
        this.chipContainer .style("font-style", this.settings.chips.textItalic ? "italic" : "normal")
        this.chipContainer.style("text-decoration", this.settings.chips.textUnderline ? "Underline" : "none")
        this.chipContainer.style("display", "inline-block")
        this.chipContainer.style('font-family', this.settings.chips.fontFamily)
        this.chipContainer.style('font-size', this.settings.chips.chipFontSize + 'px')
        this.chipContainer.style('color', this.settings.chips.chipTextColor)
        this.chipContainer.style('background-color', this.settings.chips.chipColor)
        this.chipContainer.style('border-radius',this.settings.chips.chipBorderRadius+ 'px')    
        this.dropdownContainer.style('scrollbar-color',` ${this.settings.scrollbar.scrollbarThumbColor} ${this.settings.scrollbar.scrollbarTrackColor}`)
     this.dropdownContainer.style('scrollbar-width','thin')
     this.dropdownContainer.style('border-radius',` ${this.settings.scrollbar.scrollbarRadius}`)
this.dropdownContainer.style('color', this.isHighContrast ? this.foregroundColor: this.settings.general.listColor)
        this.dropdownContainer.style("scrollbar-button","transparent")
        this.dropdownContainer.style('webkit-appearance', 'none');  // Rimuove l'aspetto nativo
this.chipContainer.style('color', this.settings.chips.chipTextColor)
this.dropdownContainer.style('accent-color', this.settings.general.checkboxCheckedColor)

const button = this.dropdownContainer.select(".dropdown-button");
button.style('font-family', this.settings.general.fontFamily)
      .style('font-size', this.settings.general.fontSize + 'px')
      .style('color', this.isHighContrast ? this.foregroundColor: this.settings.general.fontColor)
      .style('background-color', this.isHighContrast ? this.backgroundColor : this.settings.general.backgroundColor)
      .style('border-radius', this.settings.general.borderRadius + 'px')
      .style('border-color', this.settings.general.borderColor)
     .style('font-weight', this.settings.general.textBold ? "bold" : "normal")
    .style("font-style", this.settings.general.textItalic ? "italic" : "normal")
    .style("box-shadow",'0px 0px 10px 0px'+ this.settings.general.boxShadowColor)
      .style("text-decoration", this.settings.general.textUnderline ? "underline" : "none")
      .style('border-width', this.settings.general.borderWidth + 'px');

// Update label within button
button.select(".dropdown-label")
      .text(this.fieldName || "Select");
        const dropdownOptionsContainer = this.dropdownContainer.select(".dropdown-options") .style("border-color", this.settings.general.borderColor);;
        dropdownOptionsContainer.selectAll("*").remove();

        this.updateChips(values);
        this.populateDropdownOptions(filteredValues, selectionIds);
    }

    private populateDropdownOptions(values: any[], selectionIds: ISelectionId[]) {
        console.log("populateDropdownOptions called with values:", values); // Log per verificare i valori passati
        const dropdownOptionsContainer = this.dropdownContainer.select(".dropdown-options")
            .style("background-color", "transparent");
    
        dropdownOptionsContainer.selectAll("*").remove(); // Pulisci il contenitore
    
        values.forEach((value, index) => {
            const checkboxContainer = dropdownOptionsContainer.append("div")
                .attr("class", "checkbox-item")
                .on("mouseover", () => {
                    d3.select(checkboxContainer.node())
                        .style("background-color", this.settings.general.hoverColor)
                        .style("color", this.settings.general.hoverLabelColor)
                        .style("border-radius", "9px");
                })
                .on("mouseout", () => {
                    d3.select(checkboxContainer.node())
                        .style("background-color", this.settings.general.backgroundColor)
                        .style("color", this.isHighContrast ? this.foregroundColor : this.settings.general.listColor);
                });
    
            checkboxContainer.append("input")
                .attr("type", "checkbox")
                .attr("id", `checkbox-${index}`)
                .property("checked", this.selectedValues.has(value))
                .on("change", (event: Event) => this.onCheckboxChange(event, value, selectionIds));
    
            checkboxContainer.append("label")
                .attr("for", `checkbox-${index}`)
                .style("accent-color", this.settings.general.checkboxCheckedColor)
                .text(this.formatValue(value));
        });
    
        console.log("Dropdown options populated with filtered values."); // Log per confermare il popolamento
    }    private clear() {
        this.renderFiltered = null; // reset the renderFiltered function when data is epmty
        if (this.tableView) {
            this.tableView.empty();
        }
    }

    private handleContextMenu() { 
        this.dropdownContainer.on('contextmenu', (event: PointerEvent, dataPoint) => {
            event.preventDefault();  // Prevenire il comportamento predefinito del clic destro
            
            // Mostrare il menu contestuale tramite il SelectionManager
            this.selectionManager.showContextMenu(
                {},
                {
                    x: event.clientX,
                    y: event.clientY,
                }
            );
            event.preventDefault();
        });
    }

    private formatValue(value: any): string {
        return value instanceof Date ? value.toLocaleDateString() : value.toString();
    }
    private addClearAllButtonListener() {
        const clearAllButton = this.dropdownContainer.select(".clear-all-btn");
    
        clearAllButton.on("click", () => {
            // Clear all selections
            this.selectedIndices = [];
            this.selectionManager.clear();
    
            // Update UI to reflect the cleared state
            this.updateChips([]);
            this.updateSelection([]);
            this.updateDropdownOptions([]);
           // Update label to show the default placeholder (if needed)
        });
    }
  
    // Metodo chiamato quando si scrive nel campo di ricerca
    private onSearch() {
        const searchTerm = this.dropdownContainer
            .select(".search-input")
            .property("value")
            ?.toLowerCase()
            .trim() ?? "";
    
        this.searchTerm = searchTerm; // Aggiorna il termine di ricerca
    
        console.log("Search Term:", this.searchTerm); // Log del termine di ricerca
    
        const filteredValues = this.getFilteredValues(this.searchTerm);
        console.log("Filtered Values:", filteredValues); // Log dei valori filtrati
    
        this.updateDropdownOptions(filteredValues);
    
        // Mostra il pulsante "clear" se c'è un termine di ricerca
        this.toggleClearSearchButton(searchTerm.length > 0);
    }
    // Metodo per filtrare i valori in base al termine di ricerca
    private getFilteredValues(searchTerm: string): any[] {
        const values = this.dataView.categorical.categories[0]?.values ?? [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
        return values.filter((value: any) => {
            const formattedValue = this.formatValue(value);
            return formattedValue?.toLowerCase().includes(lowerCaseSearchTerm);
        });
    } 
    
 
    // Metodo per ripulire la ricerca
  
    // Mostra o nasconde il pulsante per cancellare la ricerca
    private toggleClearSearchButton(show: boolean) {
        console.log("toggleClearSearchButton called, show:", show); // Log per verificare quando viene chiamato
        this.dropdownContainer.select(".clear-search")
            .style("display", show ? "block" : "none");
    }
    
    // Metodo chiamato quando si seleziona un valore
    
    
    // Aggiorna dinamicamente le opzioni nella dropdown
    private updateDropdownOptions(filteredValues: any[]) {
        const dropdownOptionsContainer = this.dropdownContainer.select(".dropdown-options");
        dropdownOptionsContainer.selectAll("*").remove(); // Pulisci il contenitore
    
        console.log("Updating Dropdown Options with Values:", filteredValues); // Log dei valori aggiornati nel dropdown
    
        if (filteredValues.length > 0) {
            this.populateDropdownOptions(filteredValues, this.createSelectionIds(filteredValues));
        } else {
            dropdownOptionsContainer.append("div")
                .attr("class", "no-results")
                .text("Nessun risultato trovato");
        }
    }
    
    // Crea gli ID per le opzioni filtrate
    private createSelectionIds(filteredValues: any[]): ISelectionId[] {
        const category = this.dataView.categorical.categories[0];
        return filteredValues.map((value) => {
            const index = category.values.indexOf(value);
            return this.host.createSelectionIdBuilder()
                .withCategory(category, index)
                .createSelectionId();
        });
    }
    
    
    private toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
        const dropdownOptionsContainer = this.dropdownContainer.select(".dropdown-options");
        dropdownOptionsContainer.style("display", this.isDropdownOpen ? "block" : "none");
    
        const arrow = this.dropdownContainer.select(".dropdown-arrow")
            .style("color", this.isHighContrast ? this.foregroundColor : this.settings.general.arrowColor)
            .html(this.settings.general.arrowShape); // Set the arrow shape initially
    
        // Rotate arrow
        const rotation = this.isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        arrow.style("transform", rotation);
    
        console.log("Dropdown Open:", this.isDropdownOpen); // Log dello stato del dropdown
    
        // Mantieni il termine di ricerca e aggiorna il dropdown con i valori filtrati
        let filteredValues: any[];
        if (this.searchTerm) {
            filteredValues = this.getFilteredValues(this.searchTerm);
        } else {
            filteredValues = this.dataView.categorical.categories[0]?.values ?? [];
        }
    
        console.log("Filtered Values on Toggle:", filteredValues); // Log dei valori filtrati quando il dropdown viene aperto/chiuso

        this.updateDropdownOptions(filteredValues);
    }
    private onCheckboxChange(event: Event, value: any, selectionIds: ISelectionId[]) {
        const target = event.target as HTMLInputElement;
    
        // Aggiungi o rimuovi il valore dalla selezione
        if (target.checked) {
            this.selectedValues.add(value);
        } else {
            this.selectedValues.delete(value);
        }
    
        console.log("Selected Values:", Array.from(this.selectedValues)); // Log dei valori selezionati
      
        // Aggiorna la selezione se l'interazione è permessa
        if (this.allowInteractions) {
            const selectedSelectionIds = this.getSelectedSelectionIds(selectionIds);
            this.updateSelection(selectedSelectionIds);
        }
    
        // Mantieni attivo il filtro di ricerca corrente
        const filteredValues = this.searchTerm
            ? this.getFilteredValues(this.searchTerm) // Valori filtrati
            : this.dataView.categorical.categories[0]?.values ?? [];
    
        console.log("Filtered Values after Checkbox Change:", filteredValues); // Log dei valori filtrati dopo la selezione
    
        // Aggiorna solo i valori visibili nel dropdown
    
          this.updateDropdownOptions(filteredValues);
        // Aggiorna le chips per mostrare i valori selezionati
        this.updateChips(this.dataView.categorical.categories[0].values);this.renderSelection();
    }
    private getSelectedSelectionIds(selectionIds: ISelectionId[]): ISelectionId[] {
        const categoryValues = this.dataView.categorical.categories[0]?.values || [];
        const selectedSelectionIds: ISelectionId[] = [];
    
        // Mappa i valori selezionati ai rispettivi selectionIds
        this.selectedValues.forEach(value => {
            const index = categoryValues.indexOf(value);
            if (index !== -1 && selectionIds[index]) {
                selectedSelectionIds.push(selectionIds[index]);
            }
        });
    
        return selectedSelectionIds;
    }
    private renderSelection() {
        console.log("Rendering selection...");
    
        // Ottieni i valori selezionati
        const selectedValues = Array.from(this.selectedValues);
    
        // Se hai chips da mostrare, aggiornale
        this.updateChips(selectedValues);
    
        // Se hai un menu a tendina, aggiorna le opzioni in base alla selezione
        this.updateDropdownOptions(this.dataView.categorical.categories[0]?.values ?? []);
    
       
    }
    private updateSelection(selectionIds: ISelectionId[]) {
        if (selectionIds.length > 0) {
            this.selectionManager.select(selectionIds).then(() => {
                console.log("Applying filter with selected values:", selectionIds);
                this.host.applyJsonFilter(
                    this.createMultiSelectFilter(),
                    "general",
                    "filter",
                    powerbi.FilterAction.merge
                );
            });
        } else {
            this.selectionManager.clear().then(() => {
                console.log("Clearing filter");
                this.host.applyJsonFilter(null, "general", "filter", powerbi.FilterAction.remove);
            });
        }
    }
  
    
 
    
    
    private updateChips(values: any[]) {
        const chipContainer = this.chipContainer;
        chipContainer.selectAll("*").remove();
        
        // Assicurati che selectedValues sia sempre aggiornato
        if (!this.selectedValues) {
            this.selectedValues = new Set();
        }
    
        const displayedValues = Array.from(this.selectedValues).slice(0, 3);
        const hiddenValues = Array.from(this.selectedValues).slice(3);
    
        displayedValues.forEach(value => {
            const chip = chipContainer.append("div")
                .attr("class", "chip")
                .style("display", "inline-flex")
                .style("align-items", "center")
                .style("margin-right", "5px")
                .style("padding", "5px 10px")
                .style("background-color", this.settings.chips.chipInternbg)
                .style("text-decoration", this.settings.chips.textUnderline ? "Underline" : "none")
                .style("color", this.isHighContrast ? this.foregroundColor : this.settings.chips.chipTextColor)
                .style("border-radius", this.settings.chips.chipBorderRadius + "px");
    
            chip.text(this.formatValue(value));
            console.log(`Chip created for value:`, value);
        });
    
        if (hiddenValues.length > 0) {
            const viewMore = chipContainer.append("div")
                .attr("class", "chip-view-more")
                .style("display", "inline-flex")
                .style("align-items", "center")
                .style("margin-right", "5px")
                .style("padding", "5px 10px")
                .style("background-color", this.settings.chips.chipColor)
                .style("color", this.settings.chips.chipTextColor)
                .style("border-radius", this.settings.chips.chipBorderRadius + "px")
                .style("cursor", "pointer");
    
            viewMore.text(`+${hiddenValues.length} `);
    
            this.tooltipServiceWrapper.addTooltip(viewMore,
                (tooltipEvent: any) => [{
                    displayName: `${this.fieldName} :`,
                    value: hiddenValues.map(value => this.formatValue(value)).join(", ")
                }]
            );
        }
    
        // Pulsante "Clear All"
        const clearAllButton = chipContainer.append("div")
            .attr("class", "clear-all-chip")
            .html("⌫")
            .style("display", "inline-flex")
            .style("align-items", "center")
            .style("margin-left", "10px")
            .style("padding", "5px 10px")
            .style("cursor", "pointer")
            .style("background-color", this.settings.chips.chipColor)
            .style("color", this.settings.chips.chipTextColor)
            .style("border-radius", this.settings.chips.chipBorderRadius + "px")
            .on("click", () => this.clearAllSelections(values));
    
        this.tooltipServiceWrapper.addTooltip(clearAllButton,
            (tooltipEvent: any) => [{
                displayName: `Clear`,
                value: ''
            }]
        );
    }
    
    // Metodo per ripristinare i valori selezionati al cambio di pagina
    private restoreSelectedChips(options: VisualUpdateOptions) {
        if (options.jsonFilters && options.jsonFilters.length > 0) {
            const restoredValues = new Set<string>();
    
            options.jsonFilters.forEach((filter) => {
                if ((filter as any).conditions) {
                    // Se il filtro ha la proprietà conditions (tipicamente per AdvancedFilter)
                    const conditions = (filter as any).conditions;
                    conditions.forEach((condition: any) => {
                        if (condition.value) {
                            restoredValues.add(condition.value.toString());
                        }
                    });
                } else if ((filter as IBasicFilter).values) {
                    // Se il filtro è un BasicFilter
                    const basicFilter = filter as IBasicFilter;
                    basicFilter.values.forEach((value) => {
                        restoredValues.add(value.toString());
                    });
                }
            });
    
            this.selectedValues = restoredValues;
    
            // Ricarica i chip selezionati
            this.updateChips(Array.from(this.selectedValues));
        }
    }
    
    private clearAllSelections(values: any[]) {
        // Rimuovi tutte le selezioni
        this.selectedValues.clear();
        console.log("All selections cleared.");
    
        // Aggiorna l'interfaccia utente
        this.updateSelection([]);
        this.updateChips(values); // Rimuove anche tutte le chip
        // Aggiorna le opzioni del dropdown
        console.log("UI updated after clearing selections.");
    }
    private removeChip(value: any) {
        this.selectedValues.delete(value);
        this.updateChips(this.dataView.categorical.categories[0].values);
        this.updateSelection(this.createSelectionIds(Array.from(this.selectedValues)));
    }
    

    private createMultiSelectFilter() {
        const category = this.dataView.categorical.categories[0];
        const filterTarget: IFilterTarget = {
            table: category.source.queryName.split(".")[0],
            column: category.source.displayName
        };
        const filterValues = Array.from(this.selectedValues).map(value => {
            return value instanceof Date ? value.toISOString() : value;
        }); 
    
        console.log("createMultiSelectFilter called with values:", filterValues); // Log per verificare i valori passati
    
        return new BasicFilter(filterTarget, "In", filterValues as (string | number | boolean)[]);
    }  
   
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options); instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule // <=== Support conditional formatting
    }
}
function d3Select(element: any): any {
    throw new Error("Function not implemented.");
}

