import { useEffect, useReducer, useRef, useState } from "react";
import { clsx } from "clsx";
import { useLocalStorage } from "@uidotdev/usehooks";

const LOCAL_STORAGE_KEY = "todos-react";

type TODO = {
  id: string;
  title: string;
  completed: boolean;
};

type ToDoAction =
  | { type: "ADD_TODO"; value: TODO["title"] }
  | { type: "TOGGLE_COMPLETED"; id: TODO["id"] }
  | { type: "TOGGLE_ALL" }
  | { type: "DESTROY"; id: TODO["id"] }
  | { type: "EDIT_TODO"; id: TODO["id"]; value: TODO["title"] }
  | { type: "DESTROY_COMPLETED" };

type TodoListProps = {
  todos: TODO[];
  onCompletedToggle: (
    id: Pick<TODO, "id">
  ) => React.ChangeEventHandler<HTMLInputElement>;
  onToggleAll: () => void;
  onDestroy: (id: Pick<TODO, "id">) => void;
  onTodoEdit: (args: Pick<TODO, "id" | "title">) => void;
};

type TodoItemProps = Pick<
  TodoListProps,
  "onCompletedToggle" | "onDestroy" | "onTodoEdit"
> & { todo: TODO };

function App() {
  const [todosFromLocalStorage, persisTodos] = useLocalStorage<TODO[]>(
    LOCAL_STORAGE_KEY,
    []
  );
  const [todos, dispatch] = useReducer(reducer, todosFromLocalStorage);

  useEffect(() => {
    persisTodos(todos);
  }, [todos, persisTodos]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = (
      form.elements.namedItem("new-todo") as HTMLInputElement
    ).value.trim();
    if (value && value.length > 0) {
      dispatch({
        type: "ADD_TODO",
        value: value,
      });
      form.reset();
    }
  };

  const handleCompletedToggle: TodoListProps["onCompletedToggle"] =
    ({ id }) =>
    () => {
      return dispatch({ type: "TOGGLE_COMPLETED", id });
    };

  const handleToggleAll = () => {
    return dispatch({ type: "TOGGLE_ALL" });
  };

  const handleDestroy: TodoListProps["onDestroy"] = ({ id }) => {
    return dispatch({ type: "DESTROY", id });
  };

  const handleTodoEdit: TodoListProps["onTodoEdit"] = ({
    id,
    title: value,
  }) => {
    const trimmedValue = value.trim();
    if (trimmedValue === "") {
      return dispatch({ type: "DESTROY", id });
    }
    return dispatch({ type: "EDIT_TODO", id, value: trimmedValue });
  };

  const handleClearingCompleted = () => {
    return dispatch({ type: "DESTROY_COMPLETED" });
  };

  const todoListProps: TodoListProps = {
    todos,
    onCompletedToggle: handleCompletedToggle,
    onToggleAll: handleToggleAll,
    onDestroy: handleDestroy,
    onTodoEdit: handleTodoEdit,
  };

  return (
    <>
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
        {todos.length > 0 && (
          <Footer todos={todos} onClearCompleted={handleClearingCompleted} />
        )}
      </section>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>
          Created by <a href="http://todomvc.com">Muhammad Saqib</a>
        </p>
        <p>
          Part of <a href="http://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
}

function TodosList({
  todos,
  onCompletedToggle,
  onToggleAll,
  onDestroy,
  onTodoEdit,
}: TodoListProps) {
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
            onDestroy={onDestroy}
            onTodoEdit={onTodoEdit}
          />
        ))}
      </ul>
    </section>
  );
}

function TodoItem({
  todo,
  onCompletedToggle,
  onDestroy,
  onTodoEdit,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const inputRef: React.Ref<HTMLInputElement> = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleEditing: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setEditing(false);
    onTodoEdit({
      id: todo.id,
      title: (
        event.currentTarget.elements.namedItem("edit-todo") as HTMLInputElement
      ).value,
    });
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    setEditing(false);
    onTodoEdit({ id: todo.id, title: event.target.value });
  };

  const handleEscKey: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Escape") {
      setEditing(false);
      const inputElement = event.target as HTMLInputElement;
      const formElement = inputElement.closest("form");
      formElement?.reset();
      inputElement.blur();
    }
  };

  return (
    <li className={clsx({ completed: todo.completed, editing })}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={onCompletedToggle(todo)}
        />
        <label onDoubleClick={() => setEditing(true)}>{todo.title}</label>
        <button className="destroy" onClick={() => onDestroy(todo)}></button>
      </div>
      <form onSubmit={handleEditing}>
        <input
          ref={inputRef}
          name="edit-todo"
          className="edit"
          defaultValue={todo.title}
          onBlur={handleBlur}
          onKeyDown={handleEscKey}
        />
        <input type="submit" hidden />
      </form>
    </li>
  );
}

function Footer({
  todos,
  onClearCompleted,
}: {
  todos: TODO[];
  onClearCompleted: () => void;
}) {
  const itemsLeft = todos.reduce((acc, { completed }) => {
    if (!completed) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{itemsLeft}</strong>{" "}
        {itemsLeft > 1 ? "items left" : "item left"}
      </span>
      {itemsLeft !== todos.length && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
}

function reducer(todos: TODO[], action: ToDoAction): TODO[] {
  switch (action.type) {
    case "ADD_TODO": {
      return [
        ...todos,
        {
          id: window.crypto.randomUUID(),
          title: action.value,
          completed: false,
        },
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
        todo.id === action.id ? { ...todo, title: action.value } : todo
      );
    }

    case "DESTROY_COMPLETED": {
      return todos.filter((todo) => !todo.completed);
    }

    default: {
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
    }
  }
}

export default App;
