import { types } from '../types';
import { ensureArray, toISO, addToQuery } from '../utils';
import { ISkill } from 'flowzilla';

export const softDeleteSkill = (options: any = {}): ISkill => {
  const { removedField = 'rem' } = options;

  return function softDelete(type, payload, flow) {
    if (type === types.INITIALIZE) {
      payload.columns = [...payload.columns, removedField];
      payload.indices = [...payload.indices, removedField];
      return flow(payload);
    }
    if (type === 'all' || type === 'count') {
      const [model, arg = {}] = payload;
      arg.where = addToQuery(arg.where, 'AND', `${removedField} = ?`, null);
      flow([model, arg]);
    } else if (type === 'remove') {
      const [model, arg = {}] = payload;
      flow.reset(types.INSERT, [
        model,
        ensureArray(arg).map(id => ({
          id: id.id || id,
          [removedField]: toISO(new Date())
        }))
      ]);
    } else {
      flow(payload);
    }
  };
};