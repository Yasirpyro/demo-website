import { useState, type CSSProperties } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import imageData from '../../config/images.generated.json';
const images: Record<string, { blur: string; width: number; height: number }> = imageData;
interface Props {
  image: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  position?: string;
}
export function FoodImage({ image, ...props }: Props) {
  return <ImageContent key={image} image={image} {...props} />;
}
function ImageContent({
  image,
  alt,
  className = '',
  priority = false,
  sizes = '(min-width: 1024px) 40vw, 90vw',
  position = 'center',
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const source = images[image];
  const style: CSSProperties = {
    backgroundImage: source && !failed ? 'url(' + source.blur + ')' : undefined,
  };
  return (
    <div className={'food-image ' + className + (loaded ? ' is-loaded' : '')} style={style}>
      {source && !failed ? (
        <img
          src={'/images/' + image + '-960.webp'}
          srcSet={[480, 960, 1600]
            .map((w) => '/images/' + image + '-' + w + '.webp ' + w + 'w')
            .join(', ')}
          sizes={sizes}
          alt={alt}
          width={source.width}
          height={source.height}
          loading={priority ? 'eager' : 'lazy'}
          {...{ fetchpriority: priority ? 'high' : 'auto' }}
          decoding="async"
          style={{ objectPosition: position }}
          onLoad={() => {
            setLoaded(true);
            // Retire the initial hint before responsive viewport changes can refetch it.
            if (priority) document.querySelector('link[data-hero-preload]')?.remove();
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="food-fallback" role="img" aria-label={alt}>
          <UtensilsCrossed size={32} strokeWidth={1} aria-hidden="true" />
          <span>{alt}</span>
        </div>
      )}
    </div>
  );
}
