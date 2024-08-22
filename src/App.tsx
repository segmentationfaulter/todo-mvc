import { useEffect, useReducer, useRef, useState } from "react";
import { clsx } from "clsx";

function App() {
  const [todos, dispatch] = useReducer(reducer, []);
  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch({
      type: "ADD_TODO",
      value: event.target.elements["new-todo"].value,
    });
    event.target.reset();
  };

  const handleCompletedToggle = (id) => () => {
    return dispatch({ type: "TOGGLE_COMPLETED", id });
  };

  const handleToggleAll = () => {
    return dispatch({ type: "TOGGLE_ALL" });
  };

  const handleDestroy = (id) => {
    return dispatch({ type: "DESTROY", id });
  };

  const handleTodoEdit = (id) => (event) => {
    return dispatch({ type: "EDIT_TODO", id, value: event.target.value });
  };

  const todoListProps = {
    todos,
    onCompletedToggle: handleCompletedToggle,
    onToggleAll: handleToggleAll,
    onDestroy: handleDestroy,
    onTodoEdit: handleTodoEdit,
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
      <TodosList {...todoListProps} />
    </section>
  );
}

function TodosList({
  todos,
  onCompletedToggle,
  onToggleAll,
  onDestroy,
  onTodoEdit,
}) {
  return (
    <section className="main">
      <input
        id="toggle-all"
        className="toggle-all"
        type="checkbox"
        onChange={onToggleAll}
      />
      <label htmlFor="toggle-all">Mark all as complete</label>
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onCompletedToggle={onCompletedToggle}
            onDestory={onDestroy}
            onTodoEdit={onTodoEdit}
          />
        ))}
      </ul>
    </section>
  );
}

function TodoItem({ todo, onCompletedToggle, onDestory, onTodoEdit }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <li className={clsx({ completed: todo.completed, editing })}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={onCompletedToggle(todo.id)}
        />
        <label onDoubleClick={() => setEditing(true)}>{todo.todo}</label>
        <button className="destroy" onClick={() => onDestory(todo.id)}></button>
      </div>
      <input
        ref={inputRef}
        className="edit"
        value={todo.todo}
        onChange={onTodoEdit(todo.id)}
        onBlur={() => setEditing(false)}
      />
    </li>
  );
}

function reducer(todos, action) {
  switch (action.type) {
    case "ADD_TODO": {
      return [
        {
          id: window.crypto.randomUUID(),
          todo: action.value,
          completed: false,
        },
        ...todos,
      ];
    }

    case "TOGGLE_COMPLETED": {
      return todos.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    }

    case "TOGGLE_ALL": {
      const completed = todos.some((todo) => !todo.completed);
      return todos.map((todo) => ({ ...todo, completed }));
    }

    case "DESTROY": {
      return todos.filter((todo) => todo.id !== action.id);
    }

    case "EDIT_TODO": {
      return todos.map((todo) =>
        todo.id === action.id ? { ...todo, todo: action.value } : todo
      );
    }
  }
}

export default App;
