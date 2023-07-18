import generateTestData from '../data';


export * from './itemsActions'

export * from '../slices/listsSlice'
export * from '../slices/dialogsSlice'
export * from '../slices/userSlice'
export * from '../slices/dndSlice'
export * from '../slices/layoutsSlice'
export * from '../slices/focusSlice'
export * from '../slices/licenseSlice'


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