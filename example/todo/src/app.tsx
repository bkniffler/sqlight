import * as React from 'react';
import {
  DebeProvider,
  useAll,
  useCollection,
  useConnectionState
} from 'debe-react';
import App from './components/app';
import { IDBDebe } from 'debe-idb';
import { MemoryDebe } from 'debe-memory';
import { SyncClient } from 'debe-sync';
import { Debe } from 'debe';
import { schema } from '../shared';

interface ITodo {
  id?: string;
  title: string;
  completed: boolean;
}

function Todo({ title }: { title: string }) {
  const state = useConnectionState();
  const [all] = useAll<ITodo>('todo', { orderBy: 'title' });
  const collection = useCollection<ITodo>('todo');
  if (typeof document !== 'undefined') {
    const clean = document.title.split('(')[0].trim();
    const num = all.filter(x => !x.completed).length;
    document.title = num ? `${clean} (${num})` : clean;
  }
  return (
    <App title={`${title} (${state})`} todos={all} collection={collection} />
  );
}

function Instance({ get, title }: { get: () => Debe; title: string }) {
  return (
    <DebeProvider
      value={() => {
        const db = get();
        const sync = new SyncClient(db, ['localhost', 9911]);
        return db;
      }}
      initialize={async db => {
        /*
        const todo = db.use<ITodo>('todo');
        await db.initialize();if (await todo.count()) {
          return;
        }
        await todo.insert({
          title: 'Not done :(',
          completed: false
        });
        await todo.insert({
          title: 'Done :)',
          completed: true
        });*/
      }}
      render={() => <Todo title={title} />}
      loading={() => (
        <div style={{ textAlign: 'center', height: 200, padding: 50 }}>
          Is loading ...
        </div>
      )}
    />
  );
}

const hash = window.location.hash && window.location.hash.substr(1);
export default function() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Instance
        title="IndexedDebe #1"
        get={() =>
          new IDBDebe(schema, `todo${hash}`, {
            softDelete: true
          })
        }
      />
      {/*<Instance
        title="IndexedDebe #2"
        get={() => new IDBDebe(schema, 'todo2', { softDelete: true })}
      />
      <Instance
        title="MemoryDebe #1"
        get={() => new MemoryDebe(schema, { softDelete: true })}
      />
      <Instance
        title="MemoryDebe #2"
        get={() => new MemoryDebe(schema, { softDelete: true })}
      />*/}
    </div>
  );
}