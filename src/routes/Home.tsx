import { Link } from 'react-router-dom';
import { restaurant } from '../config/restaurant.config';
export default function Home() {
  return (
    <section className="recovery">
      <p className="eyebrow">{restaurant.eyebrow}</p>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.description}</p>
      <Link className="button" to="/menu">
        Explore the menu
      </Link>
    </section>
  );
}
