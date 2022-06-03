import { getStoreRepository } from './getStoreRepository';
import { getMockStoreInferface } from './StoreInterface.mock';

describe('getStoreRepository', () => {
  it('should set and get items within the store', async () => {
    const MockStoreInterface = getMockStoreInferface();
    const StoreManager = getStoreRepository(MockStoreInterface);
    await StoreManager.set('test', { testKey: 'testValue' });
    const testItem = await StoreManager.get('test');
    expect(testItem).toEqual({ testKey: 'testValue' });
  });

  it('should return undefined for items that are not in the store', async () => {
    const MockStoreInterface = getMockStoreInferface();
    const StoreManager = getStoreRepository(MockStoreInterface);
    const testItem = await StoreManager.get('test');
    expect(testItem).toBeUndefined();
  });

  it('should remove items from the store', async () => {
    const MockStoreInterface = getMockStoreInferface();
    const StoreManager = getStoreRepository(MockStoreInterface);
    await StoreManager.set('test', { testKey: 'testValue' });
    const testItem = await StoreManager.get('test');
    expect(testItem).toEqual({ testKey: 'testValue' });

    await StoreManager.remove('test');
    const removedItem = await StoreManager.get('test');
    expect(removedItem).toBeUndefined();
  });
});
