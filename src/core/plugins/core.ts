import { types } from '../types';
import { ensureArray, generate } from '../utils';
import { ISkill } from 'flowzilla';

export const coreSkill = (options: any = {}): ISkill => {
  const { idField = 'id' } = options;
  function transformForStorage(item: any) {
    if (!item) {
      return item;
    }
    if (item[idField] === undefined || item[idField] === null) {
      item[idField] = generate();
    }
    if (typeof item[idField] !== 'string') {
      item[idField] = item[idField] + '';
    }
    return item;
  }
  return function core(type, payload, flow) {
    if (type === types.INITIALIZE) {
      payload.columns = [...payload.columns, idField];
      payload.indices = [...payload.indices, idField];
      return flow(payload);
    }
    if (type === types.INSERT) {
      const [model, value] = payload;
      const isArray = Array.isArray(value);
      flow(
        [model, ensureArray(value).map(transformForStorage)],
        (result: any, flow: any) => flow(isArray ? result : result[0])
      );
    } /*else if (type === types.ALL || type === types.GET) {
      const [model, value] = payload;
      if (model && value && !value.where) {
        value.where = [];
      } else if (
        value &&
        value.where &&
        Array.isArray(value.where) &&
        typeof value.where[0] === 'string'
      ) {
        value.where = [value.where];
      }
      flow(payload);
    }*/ else {
      flow(payload);
    }
  };
};