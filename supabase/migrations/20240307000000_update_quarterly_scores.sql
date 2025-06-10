-- 四半期ごとの評価スコアを集計する関数
CREATE OR REPLACE FUNCTION get_quarterly_scores(from_date timestamp, to_date timestamp)
RETURNS TABLE (
  year integer,
  quarter integer,
  average_rating numeric,
  taste_avg numeric,
  service_avg numeric,
  price_avg numeric,
  location_avg numeric,
  hygiene_avg numeric,
  review_count integer
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_reviews AS (
    SELECT
      EXTRACT(YEAR FROM create_time)::integer as year,
      EXTRACT(QUARTER FROM create_time)::integer as quarter,
      star_rating,
      taste_score,
      service_score,
      price_score,
      location_score,
      hygiene_score
    FROM reviews
    WHERE create_time >= from_date
    AND create_time < to_date
  )
  SELECT
    year,
    quarter,
    ROUND(AVG(star_rating)::numeric, 1) as average_rating,
    ROUND(AVG(NULLIF(taste_score, 0))::numeric, 1) as taste_avg,
    ROUND(AVG(NULLIF(service_score, 0))::numeric, 1) as service_avg,
    ROUND(AVG(NULLIF(price_score, 0))::numeric, 1) as price_avg,
    ROUND(AVG(NULLIF(location_score, 0))::numeric, 1) as location_avg,
    ROUND(AVG(NULLIF(hygiene_score, 0))::numeric, 1) as hygiene_avg,
    COUNT(*)::integer as review_count
  FROM filtered_reviews
  GROUP BY year, quarter
  ORDER BY year, quarter;
END;
$$ LANGUAGE plpgsql; 