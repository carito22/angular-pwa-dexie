import Dexie, { Table } from 'dexie';

export interface Item {
  id?: number;
  userId: number;
  title: string;
  completed?: boolean;
  subtitle?: string;
}

export class AppDB extends Dexie {
  items!: Table<Item, number>;


  constructor() {
    super('dbTemporal');
    this.version(3).stores({
      items: '++id'
    });
  }
}

export const db = new AppDB();