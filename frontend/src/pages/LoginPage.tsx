import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getCurrentUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const user = await getCurrentUser();
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError("Incorrect email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</div>
        )}

        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-6"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-black underline">Register</Link>
        </p>
      </form>
    </div>
  );
}