import { Link, Route, Routes, useNavigate } from "react-router-dom";

import {useEffect, useMemo, useState} from "react";

import { api } from "./lib/api";

function Nav({ user, onLogout }) {
  return (
    <nav className="nav">
      <Link className="brand" to="/">
        HelpDesk Pro
      </Link>

      <div className="navlinks">
        <Link to="/tickets">Tickets</Link>

        <Link to="/new">
          Create Ticket
        </Link>

        {user ? (
          <>
            <span className="muted">
              {user.name}
            </span>

            <button
              className="linkbtn"
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <section className="hero">
      <span className="eyebrow">
        Customer support workspace
      </span>

      <h1>
        Resolve customer issues faster.
      </h1>

      <p>
        Track ticket priority, status and
        ownership from one clean workspace.
      </p>

      <Link
        className="primary"
        to="/tickets"
      >
        Open Support Desk
      </Link>
    </section>
  );
}

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "customer@helpdesk.pro",
    password: "Demo123!",
  });

  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const response = await api(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(form),
        }
      );

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      onLogin(response.user);

      navigate("/tickets");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page narrow">
      <form
        className="card form"
        onSubmit={submit}
      >
        <h2>Login</h2>

        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button className="primary">
          Login
        </button>

        {message && (
          <p className="error">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

function NewTicket() {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "Medium",
  });

  const [message, setMessage] =
    useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api("/tickets", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMessage("Ticket created.");

      setForm({
        subject: "",
        description: "",
        priority: "Medium",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page narrow">
      <form
        className="card form"
        onSubmit={submit}
      >
        <h2>Create Ticket</h2>

        <input
          className="input"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) =>
            setForm({
              ...form,
              subject: e.target.value,
            })
          }
        />

        <textarea
          className="input"
          rows="6"
          placeholder="Describe the issue"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <select
          className="input"
          value={form.priority}
          onChange={(e) =>
            setForm({
              ...form,
              priority: e.target.value,
            })
          }
        >
          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>
        </select>

        <button className="primary">
          Create Ticket
        </button>

        {message && (
          <p className="notice">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

function Tickets({ user }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api("/tickets")
      .then((response) => {
        setItems(response.tickets);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  const updateStatus = async (ticketId, newStatus) => {
    try {
      const response = await api(
        `/tickets/${ticketId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      setItems((currentItems) =>
        currentItems.map((ticket) =>
          ticket._id === ticketId
            ? response.ticket
            : ticket
        )
      );

      setMessage("Ticket status updated.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const visible = useMemo(() => {
    return items.filter((ticket) => {
      const matchesStatus =
        !status ||
        ticket.status === status;

      const matchesSearch =
        `${ticket.subject} ${ticket.priority}`
          .toLowerCase()
          .includes(q.toLowerCase());

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [items, status, q]);

  return (
    <section className="page">
      <div className="row between">
        <div>
          <h2>Support Tickets</h2>

          <p className="muted">
            {items.length} total tickets
          </p>
        </div>

        <div className="row">
          <input
            className="input small"
            placeholder="Search tickets"
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
          />

          <select
            className="input small"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="">
              All statuses
            </option>

            <option value="Open">
              Open
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Resolved">
              Resolved
            </option>
          </select>
        </div>
      </div>

      {message && (
        <p className="notice">
          {message}
        </p>
      )}

      <div className="grid">
        {visible.map((ticket) => (
          <article
            className="card"
            key={ticket._id}
          >
            <h3>{ticket.subject}</h3>

            <p className="muted">
              Priority: {ticket.priority}
            </p>

            <span className="chip">
              {ticket.status}
            </span>

            <p>
              {ticket.description}
            </p>

            {(user?.role === "agent" ||
              user?.role === "admin") && (
              <select
                className="input"
                value={ticket.status}
                onChange={(e) =>
                  updateStatus(
                    ticket._id,
                    e.target.value
                  )
                }
              >
                <option value="Open">
                  Open
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Resolved">
                  Resolved
                </option>
              </select>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [user, setUser] = useState(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("user") ||
            "null"
        );
      } catch {
        return null;
      }
    }
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <>
      <Nav
        user={user}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={
            <Login onLogin={setUser} />
          }
        />

        <Route
          path="/new"
          element={<NewTicket />}
        />

       <Route
          path="/tickets"
          element={<Tickets user={user} />}
        />
      </Routes>
    </>
  );
}