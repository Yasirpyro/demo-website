import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <section className="recovery">
      <p className="eyebrow">404 ? A LITTLE OFF THE MENU</p>
      <h1>This table isn?t here.</h1>
      <p>Let?s get you back to something delicious.</p>
      <Link className="button" to="/">
        Back to home
      </Link>
    </section>
  );
}
