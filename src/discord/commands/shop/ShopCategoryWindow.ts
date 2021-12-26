import CoinSystem from "../../../coinsystem/CoinSystem";
import ShopSystem, {ShopRegister} from "../../../coinsystem/shop/ShopSystem";
import TextWindow, {Input} from "../../../window/windowSystem/abstract/TextWindow";
import TextSelectionWindow from "../../../window/windowSystem/TextSelectionWindow";
import {makeHomeWindow} from "./HomeWindow";

export function makeShopCategoryWindow(coinSystem: CoinSystem, nav: string[], width: number): TextWindow {
    let mark: ShopRegister;

    if (nav.length === 0) {
        mark = coinSystem.shopSystem.shopRegister;
    } else {
        mark = coinSystem.shopSystem.point(nav.join("."), ShopSystem.point_cancel);
    }

    const names = mark.childreen.map((register) => register.name);

    const selection = new TextSelectionWindow(width, 7, names);

    selection.onConfirmation = (selection) => {
    };

    selection.onSelect = (s) => {
        const selectionMark = mark.childreen[s];
        if (coinSystem.shopSystem.isItemStructure(selectionMark.structure)) {
            const items = ShopSystem.findCheapest(selectionMark);

            if (items.length === 0) {
                selection.embedCreator.setField("Information", "Dieser Gegenstand ist ausverkauft.");
            } else {
                selection.embedCreator.setField("Information", "**Günstigster Preis:** " + items[0].price
                                                                + "\n**Items verfügbar:** " + items.length);
            }
        } else {
            selection.embedCreator.setField("Information", selectionMark.description);
        }
        selection.embedCreator.setField("Preis", `${mark.childreen[s].nav}`)
    };

    selection.onCancel = () => {
        selection.windowManager.newWindow(makeHomeWindow(coinSystem, width));
    }

    return selection;
}
