import generateTestData from '../data';


export * from './itemsActions'
export * from './dndActions'
export * from './focusActions'
export * from './layoutActions'


export const resetData = () => ({type: 'RESET_DATA'});
window.resetData = resetData;

export const loadTestData = () => {
    let testData = generateTestData();
    return {
        type: 'LOAD_TEST_DATA',
        items: testData.items,
        layouts: testData.layouts
    };
};
window.loadTestData = loadTestData;