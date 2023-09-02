import generateTestData from '../data';

export * from './listsSlice'
export * from './dialogsSlice'
export * from './userSlice'
export * from './dndSlice'
export * from './layoutsSlice'
export * from './focusSlice'
export * from './licenseSlice'
export * from './itemsSlice'


export const resetData = () => ({type: 'RESET_DATA'});
window.resetData = resetData;

export const loadData = ({items, layouts}) => {
    return {
        type: 'LOAD_DATA',
        items,
        layouts
    };
};

export const loadTestData = () => {
    let testData = generateTestData();
    return loadData(testData)
};
window.loadTestData = loadTestData;