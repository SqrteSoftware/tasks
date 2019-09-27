import * as ia from '../actions/itemsActions'
import rootReducer from './index'
import {createItem} from '../utils'

describe('UPDATE_ITEM_TEXT', () => {

    test('updates the text for an existing item', () => {
        let itemId = 'itemId123';
        let itemText = 'some text for the item';

        let initialState = {
            items: {
                [itemId]: createItem(itemId)
            }
        };

        let action = ia.updateItemText(itemId, itemText);
        let newState = rootReducer(initialState, action);

        expect(initialState.items[itemId].value).toEqual("");
        expect(newState.items[itemId].value).toEqual(itemText);
    });

    test('is a noop for non-existent items', () => {
        let itemId = 'itemId123';
        let itemText = 'some text for the item';

        let initialState = {
            items: {}
        };

        let action = ia.updateItemText(itemId, itemText);
        let newState = rootReducer(initialState, action);

        expect(initialState.items[itemId]).toEqual(undefined);
        expect(newState.items[itemId]).toEqual(undefined);
    });
});

describe('UPDATE_ITEM_COMPLETE', () => {

    test('updates the completed status for an existing item', () => {
        let itemId = 'itemId123';
        let itemText = 'some text for the item';
        let completeDate = new Date().toISOString();

        let initialState = {
            items: {
                [itemId]: createItem(itemId)
            }
        };

        let action = ia.updateItemComplete(itemId, true, completeDate);
        let newState = rootReducer(initialState, action);

        expect(initialState.items[itemId].complete).toEqual(false);
        expect(initialState.items[itemId].completeDate).toEqual(null);

        expect(newState.items[itemId].complete).toEqual(true);
        expect(newState.items[itemId].completeDate).toEqual(completeDate);
    });
});
