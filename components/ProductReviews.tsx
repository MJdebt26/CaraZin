import Stars from './Stars';
import { getRating, getReviews, getDistribution } from '@/lib/reviews';

// Full reviews block for the PDP: summary score + rating distribution + cards.
export default function ProductReviews({ slug }: { slug: string }) {
  const { value, count } = getRating(slug);
  const reviews = getReviews(slug, 4);
  const dist = getDistribution(slug);

  return (
    <section className="pdp-reviews" id="reviews">
      <div className="sec-eyebrow">What owners say</div>

      <div className="pdp-reviews-head">
        <div className="rev-summary">
          <div className="rev-summary-score">{value.toFixed(1)}<span className="rev-summary-out"> / 5</span></div>
          <Stars value={value} size={16} />
          <div className="rev-summary-count">Based on {count} verified reviews</div>
        </div>

        <div className="rev-dist">
          {dist.map((pct, i) => (
            <div className="rev-dist-row" key={i}>
              <span className="rev-dist-label">{5 - i}★</span>
              <span className="rev-dist-track"><span className="rev-dist-fill" style={{ width: `${pct}%` }} /></span>
              <span className="rev-dist-pct">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rev-cards">
        {reviews.map((r, i) => (
          <article className="rev-card" key={i}>
            <div className="rev-card-top">
              <Stars value={r.rating} size={12} />
              {r.verified && <span className="rev-verified">✓ Verified</span>}
            </div>
            <h3 className="rev-card-title">{r.title}</h3>
            <p className="rev-card-body">{r.body}</p>
            <div className="rev-card-foot">
              <span className="rev-card-author">{r.author}</span>
              <span className="rev-card-meta">{r.location} · {r.date}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
