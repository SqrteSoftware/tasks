import { reposition, ITEM_ORDER_SPACING } from '../utils/order'


describe('Reposition items in a list', () => {

    test('Equally space a list of items', () => {
        let items = [];
        for (let i = 100; i < 1000; i++) {
            items.push({id: "item-" + i, order: i});
        }

        let reorderedItems = reposition(items);

        expect(reorderedItems.length).toEqual(900)

        let firstItem = reorderedItems[0];
        expect(reorderedItems[0].id).toEqual('item-100')

        let lastItem = reorderedItems[items.length - 1];
        expect(lastItem.id).toEqual('item-999')

        let totalSpacing = lastItem.order - firstItem.order;
        expect(totalSpacing).toEqual(899 * ITEM_ORDER_SPACING)
    });
});