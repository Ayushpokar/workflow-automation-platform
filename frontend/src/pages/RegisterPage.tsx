import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-6">Create account</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</div>
        )}

        <label className="block text-sm text-gray-600 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm text-gray-600 mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full border rounded px-3 py-2 mb-6" />

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50">
          {isSubmitting ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-black underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}