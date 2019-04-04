import { types, fieldTypes, ICollection } from '../types';
import { ensureArray, toISO, addToQuery } from '../utils';
import { IPlugin, Debe } from '../client';

export const addSoftDelete = (client: Debe, options: any = {}) => {
  const { removedField = 'rem' } = options;
  const softDeletePlugin: IPlugin = (type, payload, flow) => {
    if (type === types.COLLECTION) {
      (payload as ICollection).specialFields.rem = removedField;
      (payload as ICollection).fields[removedField] = fieldTypes.NUMBER;
      (payload as ICollection).index[removedField] = fieldTypes.NUMBER;
      return flow(payload);
    }
    if (type === 'all' || type === 'count') {
      const [collection, arg = {}] = payload;
      arg.where = addToQuery(arg.where, 'AND', `${removedField} = ?`, null);
      flow([collection, arg]);
    } else if (type === 'remove') {
      const [collection, arg = {}] = payload;
      flow.reset(types.INSERT, [
        collection,
        ensureArray(arg).map(id => ({
          id: id.id || id,
          [removedField]: toISO(new Date())
        }))
      ]);
    } else {
      flow(payload);
    }
  };
  client.addPlugin('softDeletePlugin', softDeletePlugin, 'AFTER', 'corePlugin');
};
