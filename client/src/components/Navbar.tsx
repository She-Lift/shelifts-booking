import { Link } from "react-router";

export default function Navbar() {
  return <nav className="navbar">
    <div className="navbar-brand">
      <Link to="/" className="navbar-item">
        <strong>SHE LIFTS</strong>
      </Link>
    </div>
  </nav>;
}
