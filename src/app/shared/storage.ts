import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

export async function set(key1: string, value: any): Promise<void> {
  await Storage.set({
    key: key1,
    value: JSON.stringify(value)
  });
}

export async function get(key1: string): Promise<any> {
  const item = await Storage.get({ key: key1 });
  return JSON.parse(item.value);
}

export async function remove(key1: string): Promise<void> {
  await Storage.remove({
    key: key1
  });
}
