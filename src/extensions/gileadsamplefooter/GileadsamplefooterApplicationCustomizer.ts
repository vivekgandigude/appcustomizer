import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import styles from "./GileadsamplefooterApplicationCustomizer.module.scss";
import * as strings from "GileadsamplefooterApplicationCustomizerStrings";
import Load from "../../serviceworker";
const LOG_SOURCE: string = "GileadsamplefooterApplicationCustomizer";

export interface IGileadsamplefooterApplicationCustomizerProperties {
  // This is an example; replace with your own property
  Bottom: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GileadsamplefooterApplicationCustomizer extends BaseApplicationCustomizer<IGileadsamplefooterApplicationCustomizerProperties> {
  private _bottomPlaceholderFooter: PlaceholderContent | undefined;
  private url: string;
  @override
  public onInit(): Promise<void> {
    this.url = this.context.pageContext.web.absoluteUrl;
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    Load(this.url);
    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderPlaceHoldersHeaderandFooter
    );

    //Added the below line code to handle the possible changes on the existence of placeholders.
    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderPlaceHoldersHeaderandFooter
    );

    //The below code is used to call render method for generating the HTML elements.
    this._renderPlaceHoldersHeaderandFooter();
   
    return Promise.resolve();
  }
  private _renderPlaceHoldersHeaderandFooter(): void {
    //Handling the bottom placeholder - Footer section
    if (!this._bottomPlaceholderFooter) {
      this._bottomPlaceholderFooter =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Bottom,
          { onDispose: this._onDispose }
        );

      // The extension should not assume that the expected placeholder is available.
      if (!this._bottomPlaceholderFooter) {
        return;
      }

      if (this.properties) {
        let bottomString: string = this.properties.Bottom;
        if (!bottomString) {
          bottomString = "(The bottom footer property was not defined.)";
        }

        if (this._bottomPlaceholderFooter.domElement) {
          this._bottomPlaceholderFooter.domElement.innerHTML = `  
           <div class="${styles.appCustomHeaderFooter}">  
             <div class="ms-bgColor-themeDark ms-fontColor-white ${styles.bottom}">  
               <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> <span>Dev2</span> 
             </div>  
           </div>`;
        }
      }
    }
  }

  private _onDispose(): void {
    console.log(
      "[HeaderAndFooterAppExtensionApplicationCustomizer._onDispose] Disposed from the top header and bottom footer placeholders."
    );
  }

}
