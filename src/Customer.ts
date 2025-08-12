// src/Customer.ts
import {
    DataSource,
    Dimension,
    Attribute,
  } from '@sisense/sdk-data';
  
  /**
   * This file manually defines your data model for the "NN Dev" data source.
   */
  
  // Define the DataSource. The 'name' must exactly match your data source in Sisense.
  export const MyDataSource = new DataSource({
    name: 'NN Dev',
  });
  
  // Define the 'customer' dimension and its attributes
  export const customer = new Dimension({
    name: 'customer',
    attributes: {
      uuid: new Attribute({ name: 'uuid', type: 'text-attribute' }),
      name: new Attribute({ name: 'name', type: 'text-attribute' }),
      address_line1: new Attribute({ name: 'address_line1', type: 'text-attribute' }),
      // Add other customer attributes from your .smodel file here if needed
    },
    dataSource: MyDataSource,
  });
  
  // Define the 'site' dimension and its 'name' attribute
  export const site = new Dimension({
    name: 'site',
    attributes: {
      name: new Attribute({ name: 'name', type: 'text-attribute' }),
    },
    dataSource: MyDataSource,
  });
  
  // Define the 'leak_source_isolation' dimension and its 'leak_rate' attribute
  export const leak_source_isolation = new Dimension({
    name: 'leak_source_isolation',
    attributes: {
      leak_rate: new Attribute({
        name: 'leak_rate',
        type: 'numeric-attribute',
      }),
    },
    dataSource: MyDataSource,
  });