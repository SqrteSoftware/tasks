import * as actions from './itemsSlice'
import rootReducer from '../reducers/index'
import {createItem} from '../utils'
import generateTestData from '../data'


describe('CREATE_ITEM', () => {

    test('creates a new parent item with child item', () => {

        let initialState = {items: {}};

        let action = actions.createNewParentItemWithFocus();
        let newState = rootReducer(initialState, action);

        let itemIds = Object.keys(newState.items);
        let itemId = itemIds[0];

        expect(itemIds.length).toEqual(2);
        expect(itemId).toMatch(/item-[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/);
    });
});

describe('UPDATE_ITEM_TEXT', () => {

    test('updates the text for an existing item', () => {
        let itemId = 'itemId123';
        let itemText = 'some text for the item';

        let initialState = {
            items: {
                [itemId]: createItem(itemId)
            }
        };

        let action = actions.updateItemText(itemId, itemText);
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

        let action = actions.updateItemText(itemId, itemText);
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

        let action = actions.updateItemComplete(itemId, true, completeDate);
        let newState = rootReducer(initialState, action);

        expect(initialState.items[itemId].complete).toEqual(false);
        expect(initialState.items[itemId].completeDate).toEqual(null);

        expect(newState.items[itemId].complete).toEqual(true);
        expect(newState.items[itemId].completeDate).toEqual(completeDate);
    });
});

describe('SYNC_ITEMS', () => {

    test('An empty incoming list of items should result in no updates', () => {
        let {items} = generateTestData(false);
        let initialState = {items};

        let action = actions.syncItems([]);
        let newState = rootReducer(initialState, action);

        expect(initialState.items).toEqual(newState.items);
    });
});
