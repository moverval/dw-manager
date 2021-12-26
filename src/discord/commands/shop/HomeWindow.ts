import CoinSystem from "../../../coinsystem/CoinSystem";
import TextWindow from "../../../window/windowSystem/abstract/TextWindow";
import TextPromtWindow from "../../../window/windowSystem/TextPromptWindow";
import TextSelectionWindow from "../../../window/windowSystem/TextSelectionWindow";
import YesNoPromtWindow from "../../../window/windowSystem/YesNoPromtWindow";
import {makeShopCategoryWindow} from "./ShopCategoryWindow";

export function makeHomeWindow(coinSystem: CoinSystem, width: number): TextWindow {
    const homeWindow = new TextSelectionWindow(width, 3, ["Kaufen", "Inventar", "Schließen"]);
    homeWindow.embedCreator.statusFields.set("footer", "Mit den Reaktionen kannst du den Shop navigieren :)");
    homeWindow.onConfirmation = (selection) => {
        switch (selection) {
                case 0: // Shop
                    // this.displayShopCategoryWindow([], message, interactiveMessage, embed);
                    homeWindow.windowManager.newWindow(makeShopCategoryWindow(coinSystem, [], width));
                    break;

                case 1:
                    // homeWindow.windowManager.newWindow(makeHomeWindow(coinSystem, width));
                    const window = new TextPromtWindow("Test", "This should display a Text Prompt", width, "Default Text");
                    window.onPositive = (input) => {
                        switch (input) {
                            case "close":
                                window.windowManager.unload();
                                break;
                            case "back":
                                window.windowManager.newWindow(makeHomeWindow(coinSystem, width));
                                break;
                            default:
                                window.embedCreator.statusFields.set("Warnung", "Der Befehl wurde nicht gefunden");
                                window.render();
                                break;
                        }
                    };

                    window.onNegative = () => {
                        window.windowManager.unload();
                    };
                    homeWindow.windowManager.newWindow(window);
                    // this.displayInventoryWindow(message, interactiveMessage, embed);
                    break;

                case 2:
                    homeWindow.windowManager.unload();
                    return;

                default:
                    homeWindow.windowManager.unload();
                    break;
                    
        }
    };

    homeWindow.onCancel = () => {
        homeWindow.windowManager.unload();
    };

    return homeWindow;
}
