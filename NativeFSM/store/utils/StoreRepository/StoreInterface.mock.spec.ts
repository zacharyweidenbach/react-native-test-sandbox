import { getMockStoreInferface } from './StoreInterface.mock';

describe('getMockStoreInferface', () => {
  it('should set and get items within the store', async () => {
    const mockStoreInterface = getMockStoreInferface();
    await mockStoreInterface.setItem('test', 'test');
    const result = await mockStoreInterface.getItem('test');
    expect(result).toEqual('test');
  });

  it('should return undefined for items that are not in the store', async () => {
    const mockStoreInterface = getMockStoreInferface();
    const result = await mockStoreInterface.getItem('test');
    expect(result).toEqual(undefined);
  });

  it('should remove items from the store', async () => {
    const mockStoreInterface = getMockStoreInferface();
    await mockStoreInterface.setItem('test', 'test');
    await mockStoreInterface.removeItem('test');
    const result = await mockStoreInterface.getItem('test');
    expect(result).toEqual(undefined);
  });
});
