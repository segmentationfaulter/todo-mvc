import { useReducer } from "react";

function App() {
  const [todos, dispatch] = useReducer(reducer, []);
  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch({
      type: "ADD_TODO",
      value: event.target.elements["new-todo"].value,
    });
  };

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <form onSubmit={handleSubmit}>
          <input
            name="new-todo"
            className="new-todo"
            placeholder="What needs to be done?"
            autoFocus
          />
          <input type="submit" hidden />
        </form>
      </header>
    </section>
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TODO": {
      return [{ id: window.crypto.randomUUID(), todo: action.value }, ...state];
    }
  }
}

export default App;
