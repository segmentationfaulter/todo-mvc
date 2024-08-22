import { useReducer } from "react";
import { clsx } from "clsx";

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
      <TodosList todos={todos} />
    </section>
  );
}

function TodosList({ todos }) {
  return (
    <section className="main">
      <input id="toggle-all" className="toggle-all" type="checkbox" />
      <label htmlFor="toggle-all">Mark all as complete</label>
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem todo={todo} />
        ))}
      </ul>
    </section>
  );
}

function TodoItem({ todo }) {
  return (
    <li className={clsx({ completed: todo.completed })}>
      <div className="view">
        <input className="toggle" type="checkbox" checked={todo.completed} />
        <label>{todo.todo}</label>
        <button className="destroy"></button>
      </div>
    </li>
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TODO": {
      return [
        {
          id: window.crypto.randomUUID(),
          todo: action.value,
          completed: false,
        },
        ...state,
      ];
    }
  }
}

export default App;
