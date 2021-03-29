import React, {useMemo, useState} from 'react';
import {action, IObservableArray, makeAutoObservable, observable, runInAction} from "mobx";
import {observer} from "mobx-react-lite";

class SomePageStore {
  constructor() {
    makeAutoObservable(this, {
      fetchTags: action.bound
    });

    // чтобы играться
    (window as any).tags = this.tags;
    (window as any).fetchTags = this.fetchTags;

    this.fetchTags();
  }

  tags: IObservableArray<string> = observable.array([]);

  get tagsAsString() {
    return this.tags.join(", ");
  }

  state: "ok" | "pending" = "ok";

  async fetchTags() {
    this.state = "pending";

    try {
      const fetchedTags = await (new Promise<string[]>(((resolve, reject) => {
        try {
          setTimeout(() => resolve(["lol", "kek", "cheburek"]), 3000);
        } catch (e) {
          reject(e);
        }
      })));

      runInAction(() => {
        this.tags.replace(fetchedTags);
        this.state = "ok";
      });
    } catch (e) {
      console.error(e);
      runInAction(() => this.state = "ok");
    }
  }
}

const SomePage:React.FC = observer(() => {
  const store = useMemo(() => new SomePageStore(), []);

  const [tagInput, setTaginput] = useState("");

  // добавление тега при нажатии кнопки
  const handleAddTag = () => {
    runInAction(() => store.tags.push(tagInput));
    setTaginput("");
  };

  return <>
    {store.state === "pending" ? (
      <h1>Loading...</h1>
    ) : (
      <>
        <h1>Tags App!</h1>
        <p>Tags as string: {store.tagsAsString}</p>
        <p>Tags as list:</p>
        <ul>
          {store.tags.map((tag, i) =>
            <li key={i}>
              {tag}
            </li>
          )}
        </ul>
        <p>
          Add tag (tags array also can be accessed from window.tags):
          <br/>
          <input type="text" value={tagInput} onChange={e => setTaginput(e.target.value)}/>
          <button onClick={handleAddTag}>Add</button>
        </p>
      </>
    )}
  </>;
});

function App() {
  return (
    <div className="app">
      <SomePage/>
    </div>
  );
}

export default App;
