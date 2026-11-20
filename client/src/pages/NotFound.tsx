import { Link } from "react-router";

export default function NotFound() {
  return <>
    <div className="container">
      <h1 className="title">404 – Sidan hittades inte</h1>
      <Link to="/" className="button is-primary">Till startsidan</Link>
    </div>
  </>;
}
