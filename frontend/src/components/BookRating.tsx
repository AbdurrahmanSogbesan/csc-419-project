import { Star } from "lucide-react";

export default function BookRating({
  ratingCount,
  ratingValue,
}: {
  ratingCount: number;
  ratingValue: number;
}) {
  return (
    <div className="flex items-center gap-3 text-gray-800">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-600">
          <span className="text-base font-semibold">
            {ratingValue.toFixed(1)}
          </span>
          /5
        </p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, star) =>
            star + 1 <= Math.floor(ratingValue) ? (
              <Star
                key={star}
                size={16}
                className="fill-yellow-400 text-yellow-400"
              />
            ) : (
              <Star key={star} size={16} className="text-yellow-400" />
            ),
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600">{ratingCount} ratings</p>
    </div>
  );
}
