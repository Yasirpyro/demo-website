import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '../../config/menu.data';
import { FoodImage } from '../ui/FoodImage';
export function CategoryPanels() {
  return (
    <section className="category-section" aria-labelledby="category-heading">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE SOMETHING FOR EVERY CRAVING</p>
            <h2 id="category-heading">Find your flavour.</h2>
          </div>
          <Link className="text-link" to="/menu">
            Explore all categories
            <span className="outline-circle">
              <ArrowUpRight size={18} />
            </span>
          </Link>
        </div>
        <div className="category-panels">
          {categories.slice(0, 4).map((category) => (
            <Link key={category.id} className="category-panel" to={'/menu?category=' + category.id}>
              <FoodImage
                image={category.image}
                position={category.imagePosition}
                alt=""
                sizes="(min-width:1024px) 25vw, 80vw"
              />
              <div className="category-panel-overlay" />
              <div className="category-panel-copy">
                <span className="eyebrow">FIND YOUR FAVOURITE</span>
                <h3>{category.name}</h3>
                <p>{category.blurb}</p>
                <span className="category-panel-action">
                  View dishes
                  <ArrowUpRight size={19} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
