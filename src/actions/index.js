import generateTestData from '../data';


export * from './itemsActions'
export * from './dndActions'
export * from './focusActions'
export * from './layoutActions'
export * from './licenseActions'
export * from './userActions'
export * from './dialogsActions'

export * from '../slices/listsSlice'


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